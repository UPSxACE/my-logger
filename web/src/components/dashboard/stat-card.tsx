export default function StatCard({ height }: { height?: number | string }) {
  return (
    <div
      style={{
        minHeight: height,
        boxShadow:
          "rgba(27, 31, 35, 0.04) 0px 1px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px inset",
      }}
      className="rounded-md bg-white"
    >
      StatCard
    </div>
  );
}
