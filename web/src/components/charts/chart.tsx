"use client";
import { useInterval } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { useEffect } from "react";

let lastDate = 10;
var TICKINTERVAL = 1;
let XAXISRANGE = 10;

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Chart() {
  // const [data, setNewData] = useState([
  //   {
  //     x: lastDate,
  //     y: Math.floor(Math.random() * (90 - 10 + 1)) + 10,
  //   },
  // ]);

  let newData = [
    {
      x: 0,
      y: Math.floor(Math.random() * (90 - 10 + 1)) + 10,
    },
    {
      x: 1,
      y: Math.floor(Math.random() * (90 - 10 + 1)) + 10,
    },
    {
      x: 2,
      y: Math.floor(Math.random() * (90 - 10 + 1)) + 10,
    },
    {
      x: 3,
      y: Math.floor(Math.random() * (90 - 10 + 1)) + 10,
    },
    {
      x: 4,
      y: Math.floor(Math.random() * (90 - 10 + 1)) + 10,
    },
    {
      x: 5,
      y: Math.floor(Math.random() * (90 - 10 + 1)) + 10,
    },
    {
      x: 6,
      y: Math.floor(Math.random() * (90 - 10 + 1)) + 10,
    },
    {
      x: 7,
      y: Math.floor(Math.random() * (90 - 10 + 1)) + 10,
    },
    {
      x: 8,
      y: Math.floor(Math.random() * (90 - 10 + 1)) + 10,
    },
    {
      x: 9,
      y: Math.floor(Math.random() * (90 - 10 + 1)) + 10,
    },
    {
      x: 10,
      y: Math.floor(Math.random() * (90 - 10 + 1)) + 10,
    },
  ];

  function getNewSeries(baseval: number, yrange: any) {
    var newDate = baseval + TICKINTERVAL;
    lastDate = newDate;

    // if (newData.length > 20) {
    //   newData = newData.slice(1);
    // }
    // console.log(newData);

    for (var i = 0; i < newData.length - 11; i++) {
      // IMPORTANT
      // we reset the x and y of the data which is out of drawing area
      // to prevent memory leaks
      newData[i].x = 0 - XAXISRANGE - TICKINTERVAL;
      newData[i].y = 0;
    }

    newData.push({
      x: newDate,
      y: Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min,
    });

    // chart id, method, arguments
    ApexCharts.exec("realtime", "updateSeries", [
      {
        data: newData,
      },
    ]);
    // console.log(newData);
    // setNewData(newData);
  }

  let firstTime = true;
  const interval = useInterval(() => {
    if (firstTime) {
      firstTime = false;
      return;
    }

    getNewSeries(lastDate, {
      min: 10,
      max: 90,
    });

    // console.log(newData);
  }, 1000);

  useEffect(() => {
    interval.start();
    return interval.stop;
  }, [interval]);

  // async do request while timeoutpasses!

  const options: ApexCharts.ApexOptions = {
    // responsive: [],
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        gradientToColors: [
          "var(--mantine-primary-color-4)",
          "var(--mantine-primary-color-7)",
        ],
        stops: [50, 100],
      },
    },
    chart: {
      id: "realtime",
      animations: {
        enabled: true,
        easing: "linear",
        dynamicAnimation: {
          speed: 1000,
        },
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      events: {
        animationEnd(chart, options) {
          console.log("finished loading");
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    // title: {
    //   text: "Dynamic Updating Chart",
    //   align: "left",
    // },
    markers: {
      size: 0,
    },
    xaxis: {
      type: "numeric",
      range: XAXISRANGE,
    },
    yaxis: {
      min: 0,
      max: 100,
    },
    legend: {
      show: false,
    },
  };

  return (
    <ApexChart
      // className="h-full"
      options={options}
      series={[
        {
          name: "Desktops",
          data: newData.slice(),
          color: "var(--mantine-primary-color-7)",
        },
      ]}
      type="area"
      height={"100%"}
      width={"100%"}
    />
  );
}
