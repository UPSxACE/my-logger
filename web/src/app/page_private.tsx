"use client";

import BasicCard from "@/components/dashboard-ui/basic-card";
import CalendarCard from "@/components/dashboard-ui/calendar-card";
import ChartCard from "@/components/dashboard-ui/chart-card";
import DynamicChartCard from "@/components/dashboard-ui/dynamic-chart-card";
import TotalRequests from "@/components/info/total-requests";
import dynamic from "next/dynamic";
import GeneralStats from "./_components/general-stats";

const HomeCpuChart = dynamic(
  () => import("@/components/charts/home-cpu-chart"),
  {
    ssr: false,
  },
);

const MostRequestsChart = dynamic(
  () => import("@/components/charts/most-requests-chart"),
  {
    ssr: false,
  },
);

export default function HomePagePrivate() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-1 gap-4">
        <section id="general-stats" className="flex flex-1 flex-col">
          <div className="grid flex-1 grid-cols-4 grid-rows-[10rem_auto] gap-4">
            <GeneralStats />
            <DynamicChartCard className={"col-span-4"} rightPad="w-[107%]">
              <HomeCpuChart />
            </DynamicChartCard>
          </div>
        </section>
        <section id="general-info" className="flex flex-col gap-4">
          <CalendarCard />
          <ChartCard
            title="Most Requests"
            className="flex-[3]"
            height={"15rem"}
            bottomFix
            // square
          >
            <MostRequestsChart />
          </ChartCard>
          {/* <BasicCard height={"15rem"} className="flex-[3]" /> */}
          <BasicCard
            height={"10rem"}
            className="flex flex-[2] flex-col justify-between gap-2"
          >
            <TotalRequests />
          </BasicCard>
        </section>
      </div>
      {/* <div className="grid grid-cols-3 gap-4">
        <BasicCard height={"15rem"} />
        <BasicCard height={"15rem"} />
        <BasicCard height={"15rem"} />
      </div> */}
    </div>
  );
}
