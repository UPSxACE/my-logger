package server

import (
	"encoding/json"
	"errors"
	"math/rand"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

type FakeChartDataCircularBuffer struct {
	data        [100]ChartData
	head        int // index of the oldest element
	tail        int // index where the next element will be inserted
	full        bool
	lastUpdated time.Time
	lastIndex   int // ChartData.X is considered the "index"
}

func (cb *FakeChartDataCircularBuffer) Length() int {
	if cb.full {
		return len(cb.data)
	}
	if cb.tail >= cb.head {
		return cb.tail - cb.head
	}
	return len(cb.data) - cb.head + cb.tail
}

func (cb *FakeChartDataCircularBuffer) Push(item ChartData) {
	cb.lastUpdated = time.Now()
	cb.lastIndex = item.X
	//

	cb.data[cb.tail] = item
	cb.tail = (cb.tail + 1) % len(cb.data)
	if cb.full {
		cb.head = (cb.head + 1) % len(cb.data)
	}
	cb.full = cb.tail == cb.head
}

func (cb *FakeChartDataCircularBuffer) get(index int) ChartData {
	if index < 0 || index >= len(cb.data) {
		panic("Index out of range")
	}
	return cb.data[(cb.head+index)%len(cb.data)]
}

func (cb *FakeChartDataCircularBuffer) GetSince(lastIndexHeard int) (data []ChartData, lastIndex int, err error) {
	var dif int

	if lastIndexHeard < 0 {
		dif = globalBuffer.Length()
	}

	if lastIndexHeard >= 0 {
		dif = cb.lastIndex - lastIndexHeard
		if dif < 0 {
			return nil, -1, errors.New("bad request")
		}
		if dif > 100 {
			dif = 100
		}
	}

	chartData := []ChartData{}
	for i := 0; i < dif; i++ {
		chartData = append(chartData, cb.get(cb.Length()-dif+i))
	}

	lastX := -1
	lenChartData := len(chartData)
	if lenChartData > 0 {
		lastX = chartData[lenChartData-1].X
	}

	return chartData, lastX, nil
}

var globalBuffer = FakeChartDataCircularBuffer{}

// -----------------------------------------
type ChartData struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type Message struct {
	Name string `json:"name"`
	Data any    `json:"data"`
}

func randomIntBetween(min int, max int) int {
	return (rand.Intn(max-min+1) + min)
}

func (s *Server) getWs(c echo.Context) error {
	// fake first initialization
	if globalBuffer.Length() == 0 {
		for i := 0; i < 80; i++ {
			lastIndex := globalBuffer.lastIndex
			newIndex := lastIndex + 1
			globalBuffer.Push(ChartData{newIndex, randomIntBetween(25, 90)})
		}
	}

	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	defer ws.Close()

	// connection states
	listeningToChartUpdates := false
	lastHeardIndex := -1
	lastTimeHeard := time.Time{}

	// fake state
	lastTick := time.Now()

	var workerErr error

	readWorker := func(stop chan struct{}, wg *sync.WaitGroup) {
		defer wg.Done()

		for {
			select {
			case <-stop:
				return
			default:
				msgType, msg, err := ws.ReadMessage()
				if err != nil {
					if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {

						stop <- struct{}{}
						return
					}

					stop <- struct{}{}
					return
				}
				if msgType == websocket.TextMessage && len(msg) != 0 {
					msgJson := &Message{}
					err := json.Unmarshal(msg, msgJson)
					if err != nil {
						workerErr = err
						c.Logger().Error(err)
						ws.Close()

						stop <- struct{}{}
						return
					}

					switch msgJson.Name {
					case "chart1:start-listening":
						index, ok := msgJson.Data.(float64)
						if ok && index > 0 && int(index) < globalBuffer.lastIndex {
							lastHeardIndex = int(index)
						} else {
							lastHeardIndex = -1
						}
						listeningToChartUpdates = true
					case "chart1:stop-listening":
						listeningToChartUpdates = false
					case "chart1:update-received":
						index, ok := msgJson.Data.(float64)
						if ok && index > 0 && int(index) > lastHeardIndex {
							lastHeardIndex = int(index)
						}
					}
				}
			}
		}

	}

	writeWorker := func(stop chan struct{}, wg *sync.WaitGroup) {
		defer wg.Done()

		for {
			select {
			case <-stop:
				return
			default:
				// fake update each 5 seconds
				if time.Since(lastTick) > 5*time.Second {
					lastTick = time.Now()
					lastIndex := globalBuffer.lastIndex
					newIndex := lastIndex + 1
					globalBuffer.Push(ChartData{newIndex, randomIntBetween(25, 90)})
				}

				if listeningToChartUpdates && lastTimeHeard.Before(globalBuffer.lastUpdated) {
					lastTimeHeard = time.Now()
					newChartData, lastX, err := globalBuffer.GetSince(lastHeardIndex)
					if err != nil {
						workerErr = err
						c.Logger().Error(err)
						ws.Close()
						stop <- struct{}{}
						return
					}

					msg, err := json.Marshal(&Message{Name: "chart1:update", Data: echo.Map{
						"last_heard_index": lastX,
						"chart_data":       newChartData,
					}})
					if err != nil {
						workerErr = err
						c.Logger().Error(err)
						ws.Close()
						stop <- struct{}{}
						return
					}

					err = ws.WriteMessage(websocket.TextMessage, msg)
					if err != nil {
						if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
							stop <- struct{}{}
							return
						}
						stop <- struct{}{}
						return
					}
				}
			}
		}

	}

	stop := make(chan struct{})
	defer close(stop)

	var wg sync.WaitGroup
	wg.Add(2)

	// workers
	// NOTE: Possible race condition between the workers? (for example, when reading lastHeardIndex)
	go readWorker(stop, &wg)
	go writeWorker(stop, &wg)

	// Wait for both workers to finish
	wg.Wait()

	return workerErr
}
