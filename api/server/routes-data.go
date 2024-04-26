package server

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/UPSxACE/my-logger/api/db"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CachedResourcesData struct {
	mu         sync.Mutex
	cache      []db.ResourcesLog
	lastUpdate time.Time
}

func (s *Server) setupCachedResourcesData() {
	s.cachedResourcesData = &CachedResourcesData{
		cache:      []db.ResourcesLog{},
		lastUpdate: time.Time{},
	}
}

func (s *Server) checkCachedResourcesDataValidity() {
	s.cachedResourcesData.mu.Lock()
	defer s.cachedResourcesData.mu.Unlock()

	if time.Since(s.cachedResourcesData.lastUpdate) > 30*time.Second {
		ctx := context.Background()
		result, err := s.Collections.ResourcesLog.Find(ctx, echo.Map{}, options.Find().SetSort(
			echo.Map{"timestamp": 1},
		))
		if err != nil {
			fmt.Println("failed fetching/updating resources data")
			return
		}
		updatedResources := []db.ResourcesLog{}
		err = result.All(ctx, &updatedResources)
		if err != nil {
			fmt.Println("failed fetching/updating resources data")
			return
		}

		s.cachedResourcesData.cache = updatedResources
	}
}

type TimeChartData struct {
	X int `json:"x"`
	Y any `json:"y"`
}

func (s *Server) getDataCpu(c echo.Context) error {
	s.checkCachedResourcesDataValidity()

	cpuData := map[machineId][]TimeChartData{}
	for _, resLog := range s.cachedResourcesData.cache {
		id := resLog.MachineId.Hex()

		if cpuData[id] == nil {
			cpuData[id] = []TimeChartData{}
		}

		// Space out data in chunks of 5 minutes
		leng := len(cpuData[id])
		getLast := func() TimeChartData {
			return cpuData[id][leng-1]
		}

		sec := 1000
		min := sec * 60
		if leng == 0 || resLog.Time-getLast().X >= 5*min {
			cpuData[id] = append(cpuData[id], TimeChartData{
				X: resLog.Time,
				Y: resLog.CpuUsage,
			})
		}
	}

	return c.JSON(http.StatusOK, cpuData)
}

func (s *Server) getDataRam(c echo.Context) error {
	s.checkCachedResourcesDataValidity()

	ramData := map[machineId][]TimeChartData{}
	for _, resLog := range s.cachedResourcesData.cache {
		id := resLog.MachineId.Hex()

		if ramData[id] == nil {
			ramData[id] = []TimeChartData{}
		}

		// Space out data in chunks of 5 minutes
		leng := len(ramData[id])
		getLast := func() TimeChartData {
			return ramData[id][leng-1]
		}

		sec := 1000
		min := sec * 60
		if leng == 0 || resLog.Time-getLast().X >= 5*min {
			ramData[id] = append(ramData[id], TimeChartData{
				X: resLog.Time,
				Y: resLog.MemoryUsage,
			})
		}
	}

	return c.JSON(http.StatusOK, ramData)
}

func (s *Server) getDataDisk(c echo.Context) error {
	s.checkCachedResourcesDataValidity()

	diskData := map[machineId][]TimeChartData{}
	for _, resLog := range s.cachedResourcesData.cache {
		id := resLog.MachineId.Hex()

		if diskData[id] == nil {
			diskData[id] = []TimeChartData{}
		}

		// Space out data in chunks of 5 minutes
		leng := len(diskData[id])
		getLast := func() TimeChartData {
			return diskData[id][leng-1]
		}

		sec := 1000
		min := sec * 60
		if leng == 0 || resLog.Time-getLast().X >= 5*min {
			diskData[id] = append(diskData[id], TimeChartData{
				X: resLog.Time,
				Y: resLog.DiskUsage,
			})
		}
	}

	return c.JSON(http.StatusOK, diskData)
}

func (s *Server) getDataNetwork(c echo.Context) error {
	s.checkCachedResourcesDataValidity()

	networkData := map[machineId][]TimeChartData{}
	for _, resLog := range s.cachedResourcesData.cache {
		id := resLog.MachineId.Hex()

		if networkData[id] == nil {
			networkData[id] = []TimeChartData{}
		}

		// Space out data in chunks of 5 minutes
		leng := len(networkData[id])
		getLast := func() TimeChartData {
			return networkData[id][leng-1]
		}

		sec := 1000
		min := sec * 60
		if leng == 0 || resLog.Time-getLast().X >= 5*min {
			networkData[id] = append(networkData[id], TimeChartData{
				X: resLog.Time,
				Y: resLog.Network.Rx + resLog.Network.Tx,
			})
		}
	}

	return c.JSON(http.StatusOK, networkData)
}
