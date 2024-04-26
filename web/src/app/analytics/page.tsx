import { BsExclamationTriangleFill } from "react-icons/bs";

export default function Analytics() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8">
      <BsExclamationTriangleFill size={120} className="text-mantine-yellow-6" />
      <h1 className="m-0 text-center text-2xl font-medium text-black">
        Work in Progress!
      </h1>
    </div>
  );
}
