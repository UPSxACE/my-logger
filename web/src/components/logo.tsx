import { Anchor } from "@mantine/core";
import clsx from "clsx";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import { GiBrassEye } from "react-icons/gi";

const openSans = Montserrat({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export default function Logo() {
  return (
    <>
      <div className="relative flex h-full flex-1 items-center overflow-hidden max-md:hidden">
        <Anchor
          component={Link}
          href="/"
          className={clsx(
            "absolute flex w-full flex-1 flex-nowrap items-center justify-center gap-[0.3rem] pt-[0.3rem] text-[1.4rem] font-bold text-mantine-primary-7 !no-underline",
            openSans.className,
          )}
        >
          <GiBrassEye className={"flex text-[1.7rem] text-mantine-primary-7"} />
          <span className={clsx("m-0 transition-all duration-200")}>
            MyLogger
          </span>
        </Anchor>
      </div>
      <Anchor component={Link} href="/">
        <GiBrassEye
          className={
            "flex h-[70px] text-[1.7rem] text-mantine-primary-7 md:hidden"
          }
        />
      </Anchor>
    </>
  );
}
