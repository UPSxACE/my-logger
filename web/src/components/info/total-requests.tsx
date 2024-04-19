import { ColorSwatch, Progress } from "@mantine/core";

export default function TotalRequests() {
  return (
    <>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <ColorSwatch size={"1rem"} color="var(--mantine-primary-color-5)" />
          <span className="m-0 pt-[0.15rem] text-xs font-semibold">
            Authenticated
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ColorSwatch size={"1rem"} color="#ffb23e" />
          <span className="m-0 pt-[0.15rem] text-xs font-semibold">
            Guest Session
          </span>
        </div>
      </div>
      {/* ffb23e */}

      <div className="flex flex-col gap-2">
        <Progress value={65} classNames={{ root: "bg-[#ffb23e]" }} />
        <div className="flex justify-between">
          <span className="m-0 text-xs font-medium">65%</span>
          <span className="m-0 text-xs font-medium">35%</span>
        </div>
      </div>
      <span className="m-0 w-full text-center text-xs font-semibold">
        Total Requests
      </span>
    </>
  );
}
