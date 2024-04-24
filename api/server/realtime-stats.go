package server

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/UPSxACE/my-logger/api/db"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// type ProcessedResourcesLog struct {
// }

type RecentCpuUsageLog struct {
	Time     time.Time
	CpuUsage int
}
type RecentRamUsageLog struct {
	Time     time.Time
	RamUsage int
}

type RecentUsageStats struct {
	CpuUsage RecentCpuUsageLog
	RamUsage RecentRamUsageLog
}

type machineId = string
type RecentUsageCircularBuffer struct {
	Data           [100]*RecentUsageStats
	headPosition   int // index of the oldest element
	writerPosition int // index where the next element will be inserted
	full           bool
}

func NewResourcesCircularBuffer() *RecentUsageCircularBuffer {
	return &RecentUsageCircularBuffer{
		Data:           [100]*RecentUsageStats{},
		headPosition:   0,
		writerPosition: 0,
		full:           false,
	}
}

func (rs *RecentUsageCircularBuffer) Length() int {
	if rs.full {
		return len(rs.Data)
	}
	if rs.writerPosition >= rs.headPosition {
		return rs.writerPosition - rs.headPosition
	}
	return len(rs.Data) - rs.headPosition + rs.writerPosition
}

func (rs *RecentUsageCircularBuffer) push(item *RecentUsageStats) {
	rs.Data[rs.writerPosition] = item
	rs.writerPosition = (rs.writerPosition + 1) % len(rs.Data)
	if rs.full {
		rs.headPosition = (rs.headPosition + 1) % len(rs.Data)
	}
	rs.full = rs.writerPosition == rs.headPosition
}

func (rs *RecentUsageCircularBuffer) Get(index int) *RecentUsageStats {
	if index < 0 || index >= len(rs.Data) {
		panic("Index out of range")
	}
	return rs.Data[(rs.headPosition+index)%len(rs.Data)]
}

func (rs *RecentUsageCircularBuffer) GetAll() []*RecentUsageStats {
	length := rs.Length()

	data := make([]*RecentUsageStats, length)
	for i := 0; i < length; i++ {
		data[i] = rs.Get(i)
	}

	return data
}

type RequestsCounters struct {
	AuthenticatedCount int
	GuestCount         int
}

type GeneralStats struct {
	Machines         int
	TotalMachineLogs int
	Apps             int
	TotalAppLogs     int
}

// TODO use channel to message subecribers?
// TODO use mutex on write/read workers, and maybe subscriber buffers (???)

// NOTE: I decided to use Observer pattern, because I want to notify every user connected
// with websockets when an update happens.
type RealtimeStatsSubject struct {
	mu          sync.Mutex
	subscribers []RealtimeStatsObserver
	// should lock the subject struct before giving data to the new subscriber
	RecentUsage     map[machineId]*RecentUsageCircularBuffer
	GeneralStats    GeneralStats
	MostApiRequests map[machineId]int
	TotalRequests   RequestsCounters
	Config          RealtimeConfig
}

func (s *Server) setupRealtimeStatsSubject() {
	realtimeSubject := &RealtimeStatsSubject{}
	realtimeSubject.RecentUsage = map[machineId]*RecentUsageCircularBuffer{}
	realtimeSubject.GeneralStats = GeneralStats{}
	realtimeSubject.Config = s.LoadRealtimeConfig()

	// get all machines
	// for each machine, get their last 100 logs and create a RecentUsageCircularBuffer for it and push it to the subject Buffers
	ctx := context.Background()
	result, err := s.Collections.Machines.Find(ctx, bson.M{"deleted": false})
	if err != nil {
		log.Fatal(err)
	}
	var machines []db.Machine
	err = result.All(ctx, &machines)
	if err != nil {
		log.Fatal(err)
	}

	for _, machine := range machines {
		id := machine.ID.Hex()
		realtimeSubject.RecentUsage[id] = NewResourcesCircularBuffer()

		result, err := s.Collections.ResourcesLog.Find(ctx, bson.M{
			"machine_id": machine.ID,
		}, options.Find().SetLimit(100).SetSort(bson.M{
			"timestamp": 1,
		}))
		if err != nil {
			log.Fatal(err)
		}

		for result.Next(ctx) {
			resourceLog := &db.ResourcesLog{}
			err := result.Decode(resourceLog)
			if err != nil {
				log.Fatal(err)
			}

			realtimeSubject.ProcessLog(resourceLog)
		}
	}

	// set general stats
	realtimeSubject.GeneralStats.Machines = len(machines)
	count, err := s.Collections.ResourcesLog.CountDocuments(ctx, echo.Map{})
	if err != nil {
		log.Fatal(err)
	}
	realtimeSubject.GeneralStats.TotalMachineLogs = int(count)
	count, err = s.Collections.Apps.CountDocuments(ctx, bson.M{"deleted": false})
	if err != nil {
		log.Fatal(err)
	}
	realtimeSubject.GeneralStats.Apps = int(count)
	// NOTE: all below on process app log probs
	// FIXME count app logs
	// FIXME count api request on logs by machine
	// FIXME count session guest on logs

	// set buffers on the server instance
	s.realTimeStatsSubject = realtimeSubject
}

func (rss *RealtimeStatsSubject) Subscribe(observer RealtimeStatsObserver) {
	rss.subscribers = append(rss.subscribers, observer)
}

type ObserverId = string

func (rss *RealtimeStatsSubject) Unsubscribe(observerId ObserverId) {
	rss.mu.Lock()
	defer rss.mu.Unlock()
	for i, subscriber := range rss.subscribers {
		if subscriber.GetId() == observerId {
			subscribersLen := len(rss.subscribers)
			// swap the position of this one with the last
			rss.subscribers[subscribersLen-1], rss.subscribers[i] = rss.subscribers[i], rss.subscribers[subscribersLen-1]
			// tjen remove the last
			rss.subscribers = rss.subscribers[:subscribersLen-1]
		}
	}
}

func (rss *RealtimeStatsSubject) ProcessLog(log *db.ResourcesLog) {
	rss.mu.Lock()
	defer rss.mu.Unlock()

	time := time.Unix(int64(log.Time), 0)

	cpuUsageLog := RecentCpuUsageLog{
		Time:     time,
		CpuUsage: log.CpuUsage,
	}
	ramUsageLog := RecentRamUsageLog{
		Time:     time,
		RamUsage: log.MemoryUsage,
	}

	recentUsageStats := &RecentUsageStats{
		CpuUsage: cpuUsageLog,
		RamUsage: ramUsageLog,
	}

	rss.RecentUsage[log.MachineId.Hex()].push(recentUsageStats)
	update := RecentUsageUpdate{
		MachineId: log.MachineId.Hex(),
		UsageStats: RecentUsageStats{
			CpuUsage: cpuUsageLog,
			RamUsage: ramUsageLog,
		},
	}

	rss.notify(RealtimeUpdate{
		RecentUsageUpdate: &update,
	})
}

type RecentUsageUpdate struct {
	MachineId  machineId
	UsageStats RecentUsageStats
}
type GeneralStatsUpdate struct {
	NewStats GeneralStats
}
type MostApiRequestsUpdate struct {
	MachineId machineId
	NewCount  int
}
type TotalRequestsUpdate struct {
	NewCounters RequestsCounters
}
type ConfigUpdate struct{}

type RealtimeUpdate struct {
	RecentUsageUpdate     *RecentUsageUpdate
	GeneralStatsUpdate    *GeneralStatsUpdate
	MostApiRequestsUpdate *MostApiRequestsUpdate
	TotalRequestsUpdate   *TotalRequestsUpdate
	ConfigUpdate          *ConfigUpdate
}

func (rss *RealtimeStatsSubject) NotifyConfigChange() {
	// REVIEW: test this with multiple browsers open, and one of them
	// changing config, and others moving around
	rss.notify(RealtimeUpdate{
		ConfigUpdate: &ConfigUpdate{},
	})
}

func (rss *RealtimeStatsSubject) notify(update RealtimeUpdate) {
	for _, subscriber := range rss.subscribers {
		subscriber.ReceiveUpdate(update)
	}
}

type RealtimeStatsObserver interface {
	ReceiveUpdate(update RealtimeUpdate)
	GetId() ObserverId
}
