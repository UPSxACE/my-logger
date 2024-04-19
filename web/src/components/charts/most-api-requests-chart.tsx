import { useState } from "react";
import ReactApexChart from "react-apexcharts";

export default function MostApiRequestsChart() {
  const [state, setState] = useState([
    {
      name: "Mach. 1",
      data: 44,
    },
    {
      name: "Mach. 2",
      data: 72,
    },
    {
      name: "Mach. 3",
      data: 50,
    },
  ]);

  return (
    <ReactApexChart
      series={state.map((obj) => obj.data)}
      options={{
        colors: [
          "var(--mantine-primary-color-3)",
          "var(--mantine-primary-color-5)",
          "var(--mantine-primary-color-9)",
        ],
        grid: {
          padding: {
            top: 20,
          },
        },
        stroke: {
          width: 0, // remove white line
        },
        chart: {
          type: "donut",
        },
        labels: state.map((obj) => obj.name),
        plotOptions: {
          pie: {
            donut: {
              size: "60%",
            },
            startAngle: -90,
            endAngle: 270,
          },
        },
        dataLabels: {
          enabled: false,
        },
        fill: {
          //   type: "gradient",
        },
        legend: {
          position: "bottom",
        },
      }}
      type="donut"
      height={"100%"}
      width={"100%"}
    />
  );
}
