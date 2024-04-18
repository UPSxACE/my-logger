"use client";
import BasicCard from "@/components/dashboard/basic-card";
import CalendarCard from "@/components/dashboard/calendar-card";
import ChartCard from "@/components/dashboard/chart-card";
import StatCard from "@/components/dashboard/stat-card";
import dynamic from "next/dynamic";
import { FaRegPaperPlane } from "react-icons/fa6";
import { LuNewspaper } from "react-icons/lu";
import { RiComputerLine } from "react-icons/ri";

// const Chart = dynamic(() => import("@/components/charts/chart"), {
//   ssr: false,
// });

const Chart = dynamic(() => import("@/components/charts/chart"), {
  ssr: false,
});

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
            <ChartCard title="Chart Card" className="col-span-4">
              <Chart />
            </ChartCard>
          </div>
        </section>
        <section id="general-info" className="flex flex-col gap-4">
          <CalendarCard />
          <BasicCard height={"15rem"} className="flex-[3]" />
          <BasicCard height={"10rem"} className="flex-[2]" />
        </section>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <BasicCard height={"15rem"} />
        <BasicCard height={"15rem"} />
        <BasicCard height={"15rem"} />
      </div>
    </div>
  );
}
