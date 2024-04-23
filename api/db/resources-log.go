package db

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ResourcesLog struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	MachineId   primitive.ObjectID `json:"machine_id" bson:"machine_id"`
	Time        int                `json:"timestamp" bson:"timestamp"`
	MemoryUsage int                `json:"memory_usage" bson:"memory_usage"`
	DiskUsage   int                `json:"disk_usage" bson:"disk_usage"`
	CpuUsage    int                `json:"cpu_usage" bson:"cpu_usage"`
	Network     Network            `json:"network" bson:"network"`
}

type Network struct {
	Rx int `json:"rx" bson:"rx"`
	Tx int `json:"tx" bson:"tx"`
}
