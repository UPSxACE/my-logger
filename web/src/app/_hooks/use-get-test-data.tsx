"use client";
import { useEffect, useState } from "react";

let randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * max + min);
};

export default function useGetTestData() {
  const [japan, setJapan] = useState<any[]>([]);
  const [france, setFrance] = useState<any[]>([]);
  const [usa, setUsa] = useState<any[]>([]);

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    function generateTimeout() {
      const nextTimeout = randomNumber(500, 1500);
      const cpuUsage1 = randomNumber(30, 80);
      const cpuUsage2 = randomNumber(30, 80);
      const cpuUsage3 = randomNumber(30, 80);

      timeouts.push(
        setTimeout(() => {
          const date = Date.now();
          setUsa((val) => [
            ...val,
            {
              x: date,
              y: cpuUsage1,
            },
          ]);
          setJapan((val) => [
            ...val,
            {
              x: date,
              y: cpuUsage2,
            },
          ]);
          setFrance((val) => [
            ...val,
            {
              x: date,
              y: cpuUsage3,
            },
          ]);
          generateTimeout();
        }, nextTimeout),
      );
    }

    generateTimeout();

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const datasets = [
    {
      id: "japan",
      label: "Japan",
      backgroundColor: "hsl(14, 70%, 50%)",
      borderDash: [8, 4],
      fill: true,
      data: japan,
    },
    {
      id: "france",
      label: "France",
      backgroundColor:
        "hsl(244.05405405405406, 88.09523809523809%, 49.411764705882355%)",
      borderDash: [8, 4],
      fill: true,
      data: france,
    },
    {
      id: "usa",
      label: "USA",
      backgroundColor:
        "hsl(122.05405405405406, 44.09523809523809%, 24.411764705882355%)",
      borderDash: [8, 4],
      fill: true,
      data: usa,
    },
  ];

  return datasets;
}
