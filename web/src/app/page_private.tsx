"use client";

import BasicCard from "@/components/dashboard-ui/basic-card";
import CalendarCard from "@/components/dashboard-ui/calendar-card";
import ChartCard from "@/components/dashboard-ui/chart-card";
import StatCard from "@/components/dashboard-ui/stat-card";
import TotalRequests from "@/components/info/total-requests";
import dynamic from "next/dynamic";
import { FaRegPaperPlane } from "react-icons/fa6";
import { LuNewspaper } from "react-icons/lu";
import { RiComputerLine } from "react-icons/ri";

const HomeCpuChart = dynamic(
  () => import("@/components/charts/home-cpu-chart"),
  {
    ssr: false,
  },
);

const MostApiRequestsChart = dynamic(
  () => import("@/components/charts/most-api-requests-chart"),
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
            <StatCard
              icon={<RiComputerLine />}
              name="Machines"
              value={String(0)}
            />
            <StatCard
              icon={<LuNewspaper />}
              name="Total machine logs"
              value={String(0)}
            />

            <StatCard
              icon={<FaRegPaperPlane />}
              name="Apps"
              value={String(0)}
            />
            <StatCard
              icon={<LuNewspaper />}
              name="Total app logs"
              value={String(0)}
            />
            <ChartCard
              title="Machine 1 Cpu Usage"
              className="col-span-4"
              rightPad
            >
              <HomeCpuChart />
            </ChartCard>
          </div>
        </section>
        <section id="general-info" className="flex flex-col gap-4">
          <CalendarCard />
          <ChartCard
            title="Most Api Requests"
            className="flex-[3]"
            height={"15rem"}
            bottomFix
            // square
          >
            <MostApiRequestsChart />
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
