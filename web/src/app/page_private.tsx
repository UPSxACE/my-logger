import BasicCard from "@/components/dashboard/basic-card";
import CalendarCard from "@/components/dashboard/calendar-card";
import ChartCard from "@/components/dashboard/chart-card";
import StatCard from "@/components/dashboard/stat-card";

export default function HomePagePrivate() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-1 gap-4">
        <section id="general-stats" className="flex flex-1 flex-col">
          <div className="grid flex-1 grid-cols-4 grid-rows-[10rem_auto] gap-4">
            <StatCard />
            <StatCard />
            <StatCard />
            <StatCard />
            <ChartCard title="Chart Card" className="col-span-4">
              Chart
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
