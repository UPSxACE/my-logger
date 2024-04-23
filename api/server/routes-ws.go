package server

import (
	"encoding/json"
	"sync"

	"github.com/UPSxACE/my-logger/api/utils"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

type Message struct {
	Name string `json:"name"`
	Data any    `json:"data"`
}

type ConnectionSubscription struct {
	id                       string
	mu                       sync.Mutex
	ws                       *websocket.Conn
	realtimeStatsConfig      RealtimeConfig
	connected                bool
	listeningRecentUsage     bool
	listeningGeneralStats    bool
	listeningMostApiRequests bool
	listeningTotalRequests   bool
	workerErr                error
}

func (cs *ConnectionSubscription) GetId() string {
	return cs.id
}

func (cs *ConnectionSubscription) WriteTextMessage(message []byte) {
	err := cs.ws.WriteMessage(websocket.TextMessage, message)
	if err != nil {
		if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
			cs.connected = false
			return
		}
		cs.connected = false
		return
	}
}

func (cs *ConnectionSubscription) ReceiveUpdate(update RealtimeUpdate) {
	cs.mu.Lock()
	defer cs.mu.Unlock()

	if update.ConfigUpdate != nil {
		msg, err := json.Marshal(&Message{
			Name: "realtime:configupdate",
			Data: nil,
		})
		if err != nil {
			cs.workerErr = err
			cs.connected = false
			return
		}
		cs.WriteTextMessage(msg)
	}
	if update.GeneralStatsUpdate != nil {
		//FIXME
	}
	if update.MostApiRequestsUpdate != nil {
		//FIXME
	}
	if update.RecentUsageUpdate != nil && cs.listeningRecentUsage {
		for _, id := range cs.realtimeStatsConfig.RealtimeUsageMachinesToTrack {
			if update.RecentUsageUpdate.MachineId == id {
				msg, err := json.Marshal(&Message{
					Name: "realtime:recentusage:partialupdate",
					Data: echo.Map{
						"machine_id": update.RecentUsageUpdate.MachineId,
						"new_data": echo.Map{
							"cpu": echo.Map{
								"x": update.RecentUsageUpdate.UsageStats.CpuUsage.Time,
								"y": update.RecentUsageUpdate.UsageStats.CpuUsage.CpuUsage,
							},
							"ram": echo.Map{
								"x": update.RecentUsageUpdate.UsageStats.RamUsage.Time,
								"y": update.RecentUsageUpdate.UsageStats.RamUsage.RamUsage,
							},
						},
					}})
				if err != nil {
					cs.workerErr = err
					cs.connected = false
					return
				}
				cs.WriteTextMessage(msg)
			}
		}
	}
	if update.TotalRequestsUpdate != nil {
		//FIXME
	}
}

func (s *Server) getWs(c echo.Context) error {
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	defer ws.Close()

	// connection state
	connectionSubscription := &ConnectionSubscription{
		id:                       utils.GenerateUuid(),
		ws:                       ws,
		connected:                true,
		realtimeStatsConfig:      s.realTimeStatsSubject.Config,
		listeningRecentUsage:     false,
		listeningGeneralStats:    false,
		listeningMostApiRequests: false,
		listeningTotalRequests:   false,
	}

	s.realTimeStatsSubject.Subscribe(connectionSubscription)
	defer s.realTimeStatsSubject.Unsubscribe(connectionSubscription.GetId())

	for connectionSubscription.connected {
		// Read messages

		msgType, msg, err := ws.ReadMessage()
		func() {
			connectionSubscription.mu.Lock()
			defer connectionSubscription.mu.Unlock()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					connectionSubscription.connected = false
					return
				}
				connectionSubscription.connected = false
				return
			}
			if msgType == websocket.TextMessage && len(msg) != 0 {
				msgJson := &Message{}
				err := json.Unmarshal(msg, msgJson)
				if err != nil {
					connectionSubscription.workerErr = err
					connectionSubscription.connected = false
					return
				}

				switch msgJson.Name {
				//case messages
				case "realtime:recentusage:startlistening":
					fulldata := echo.Map{}

					for machineId, buffer := range s.realTimeStatsSubject.RecentUsage {
						for _, machineId_ := range s.realTimeStatsSubject.Config.RealtimeUsageMachinesToTrack {
							if machineId == machineId_ {
								all := buffer.GetAll()

								cpu := []echo.Map{}
								ram := []echo.Map{}

								for _, usageStat := range all {
									cpu = append(cpu, echo.Map{
										"x": usageStat.CpuUsage.Time,
										"y": usageStat.CpuUsage.CpuUsage,
									})
									ram = append(ram, echo.Map{
										"x": usageStat.RamUsage.Time,
										"y": usageStat.RamUsage.RamUsage,
									})
								}

								fulldata[machineId] = echo.Map{
									"cpu": cpu,
									"ram": ram,
								}

								break
							}
						}
					}

					msg, err := json.Marshal(&Message{
						Name: "realtime:recentusage:fullupdate",
						Data: fulldata,
					})

					if err != nil {
						connectionSubscription.workerErr = err
						connectionSubscription.connected = false
						return
					}

					connectionSubscription.WriteTextMessage(msg)
					return
				}
			}
		}()
	}

	if connectionSubscription.workerErr != nil {
		c.Logger().Error(err)
	}

	return connectionSubscription.workerErr
}
