package server

import (
	"context"
	"errors"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/UPSxACE/my-logger/api/db"
	"github.com/UPSxACE/my-logger/api/utils"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ANCHOR - RecentUsage
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

type Visitors = utils.Set[string] // unique client ip addresses across all apps

// ANCHOR - General/global stats
type GeneralStats struct {
	TotalVisitors int // should reflect a Visitors struct .Count() at all times
	MachineLogs   int
	RequestLogs   int
	AnalyticsLogs int
}

// ANCHOR - Request stats (by machine)
type RequestsCounters struct {
	AuthenticatedCount map[machineId]int
	GuestCount         map[machineId]int
}

// NOTE: I decided to use Observer pattern, because I want to notify every user connected
// with websockets when an update happens.
type RealtimeStatsSubject struct {
	mu            sync.Mutex
	subscribers   []RealtimeStatsObserver
	dbCollections *db.Collections
	// --
	// should lock the subject struct before giving data to the new subscriber
	visitors      Visitors
	RecentUsage   map[machineId]*RecentUsageCircularBuffer
	GeneralStats  GeneralStats
	MostRequests  map[machineId]int
	TotalRequests RequestsCounters
	Config        RealtimeConfig
	// batched updates
	KeepRunningBatchUpdates bool
	nextGeneralStatsUpdate  *GeneralStatsUpdate
	nextMostRequestsUpdate  *MostRequestsUpdate
	nextTotalRequestsUpdate *TotalRequestsUpdate
}

func (rss *RealtimeStatsSubject) RunBatchUpdatesChecker() {
	go func() {
		for rss.KeepRunningBatchUpdates {
			rss.mu.Lock()
			notify := false
			realtimeUpdate := &RealtimeUpdate{}
			if rss.nextGeneralStatsUpdate != nil {
				notify = true
				realtimeUpdate.GeneralStatsUpdate = rss.nextGeneralStatsUpdate
				rss.nextGeneralStatsUpdate = nil
			}
			if rss.nextMostRequestsUpdate != nil {
				notify = true
				realtimeUpdate.MostRequestsUpdate = rss.nextMostRequestsUpdate
				rss.nextMostRequestsUpdate = nil
			}
			if rss.nextTotalRequestsUpdate != nil {
				notify = true
				realtimeUpdate.TotalRequestsUpdate = rss.nextTotalRequestsUpdate
				rss.nextTotalRequestsUpdate = nil
			}
			rss.mu.Unlock()

			if notify {
				rss.notify(*realtimeUpdate)
			}

			time.Sleep(5 * time.Second)
		}
	}()
}

func (s *Server) setupRealtimeStatsSubject() {
	realtimeSubject := &RealtimeStatsSubject{KeepRunningBatchUpdates: true, dbCollections: &s.Collections}
	// initialize fields
	realtimeSubject.RecentUsage = map[machineId]*RecentUsageCircularBuffer{}
	realtimeSubject.GeneralStats = GeneralStats{}
	realtimeSubject.TotalRequests = RequestsCounters{
		AuthenticatedCount: map[string]int{},
		GuestCount:         map[string]int{},
	}
	realtimeSubject.MostRequests = map[string]int{}
	realtimeSubject.visitors = utils.NewSet[string]()
	realtimeSubject.GeneralStats.TotalVisitors = 0
	realtimeSubject.Config = s.LoadRealtimeConfig()

	// context
	ctx := context.Background()

	// Analytics is the only one that is more straightforward to just do a count instead of processing
	count, err := s.Collections.AnalyticsCollection.CountDocuments(ctx, echo.Map{})
	if err != nil {
		log.Fatal(err)
	}
	realtimeSubject.GeneralStats.AnalyticsLogs = int(count)

	// SETUP RECENT USAGE
	// get all machines
	// for each machine, get their last 100 logs and create a RecentUsageCircularBuffer for it and push it to the subject Buffers
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
		realtimeSubject.MostRequests[id] = 0

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

	// SETUP GENERAL STATS (and visitors)
	// AND MOST API REQUESTS AND TOTAL REQUESTS
	cursor, err := s.Collections.RequestsLog.Find(ctx, echo.Map{},
		options.Find().SetProjection(echo.Map{
			"ClientAddr":     1,
			"_machine_id":    1,
			"request_Cookie": 1,
		}))
	if err != nil {
		log.Fatal(err)
	}
	requestLogs := []db.RequestLog{}
	err = cursor.All(ctx, &requestLogs)
	if err != nil {
		log.Fatal(err)
	}

	// Process log request logs
	for _, rlog := range requestLogs {
		realtimeSubject.ProcessRequestLog(rlog)
	}

	// start running batch updates checker
	realtimeSubject.RunBatchUpdatesChecker()

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
func (s *Server) NewMachine(machineId string) {
	s.realTimeStatsSubject.mu.Lock()
	defer s.realTimeStatsSubject.mu.Unlock()

	s.realTimeStatsSubject.RecentUsage[machineId] = NewResourcesCircularBuffer()
	s.realTimeStatsSubject.MostRequests[machineId] = 0
	s.realTimeStatsSubject.TotalRequests.AuthenticatedCount[machineId] = 0
	s.realTimeStatsSubject.TotalRequests.GuestCount[machineId] = 0

	s.realTimeStatsSubject.nextMostRequestsUpdate = &MostRequestsUpdate{
		NewCounters: s.realTimeStatsSubject.MostRequests,
	}
	s.realTimeStatsSubject.nextTotalRequestsUpdate = &TotalRequestsUpdate{
		NewCounters: s.realTimeStatsSubject.TotalRequests,
	}
	// NOTE: there is no need to notify configuration update, because the machine by default is not being tracked anyways
}

func (s *Server) RemoveMachine(machineId string) {
	for i, machineId_ := range s.realTimeStatsSubject.Config.RealtimeUsageMachinesToTrack {
		if machineId == machineId_ {
			newConfig := s.realTimeStatsSubject.Config
			newConfig.RealtimeUsageMachinesToTrack = append(s.realTimeStatsSubject.Config.RealtimeUsageMachinesToTrack[:i], s.realTimeStatsSubject.Config.RealtimeUsageMachinesToTrack[i+1])
			s.SaveRealtimeConfig(newConfig)
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

	// increment general stats counter
	rss.GeneralStats.MachineLogs += 1

	// create update objects and notify
	rss.nextGeneralStatsUpdate = &GeneralStatsUpdate{
		NewStats: rss.GeneralStats,
	}

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

func (rss *RealtimeStatsSubject) ProcessRequestLog(rlog db.RequestLog) {
	rss.mu.Lock()
	defer rss.mu.Unlock()

	if rlog["ClientAddr"] != nil {
		ip, ok := rlog["ClientAddr"].(string)
		if !ok {
			fmt.Println(errors.New("failed converting ClientAddr to string"))
		}
		rss.visitors.Add(ip)
		rss.GeneralStats.TotalVisitors = rss.visitors.Count()
		rss.GeneralStats.RequestLogs += 1
		rss.MostRequests[ip] += 1

		if rlog["request_Cookie"] != nil {
			cookies, ok := rlog["request_Cookie"].(map[string]any)
			if ok {
				_, ok := cookies["next-auth.session-token"]
				if ok {
					rss.TotalRequests.AuthenticatedCount[ip] += 1
				}
				if !ok {
					rss.TotalRequests.GuestCount[ip] += 1
				}
			}
			if !ok {
				rss.TotalRequests.GuestCount[ip] += 1
			}
		}
		if rlog["request_Cookie"] == nil {
			rss.TotalRequests.GuestCount[ip] += 1
		}
	}

	// make update objects
	rss.nextGeneralStatsUpdate = &GeneralStatsUpdate{
		NewStats: rss.GeneralStats,
	}
	rss.nextMostRequestsUpdate = &MostRequestsUpdate{
		NewCounters: rss.MostRequests,
	}
	rss.nextTotalRequestsUpdate = &TotalRequestsUpdate{
		NewCounters: rss.TotalRequests,
	}
}

func (rss *RealtimeStatsSubject) ProcessAnalyticsLog(alog db.Analytics) {
	rss.mu.Lock()
	defer rss.mu.Unlock()

	rss.GeneralStats.AnalyticsLogs += 1
	rss.nextGeneralStatsUpdate = &GeneralStatsUpdate{
		NewStats: rss.GeneralStats,
	}
}

type RecentUsageUpdate struct {
	MachineId  machineId
	UsageStats RecentUsageStats
}
type GeneralStatsUpdate struct {
	NewStats GeneralStats
}
type MostRequestsUpdate struct {
	NewCounters map[machineId]int
}
type TotalRequestsUpdate struct {
	NewCounters RequestsCounters
}
type ConfigUpdate struct{}

type RealtimeUpdate struct {
	RecentUsageUpdate   *RecentUsageUpdate
	GeneralStatsUpdate  *GeneralStatsUpdate
	MostRequestsUpdate  *MostRequestsUpdate
	TotalRequestsUpdate *TotalRequestsUpdate
	ConfigUpdate        *ConfigUpdate
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
