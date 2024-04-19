"use client";
import { CountUp } from "countup.js";
import { useEffect, useRef } from "react";

const AnimatedNumbers = ({
  defaultNumber,
  targetNumber,
}: {
  defaultNumber: number;
  targetNumber: number;
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const countUp = useRef<CountUp | null>(null);
  const currentNumber = useRef<number>(defaultNumber);

  useEffect(() => {
    const el = ref.current;
    if (countUp.current === null && el) {
      countUp.current = new CountUp(el, defaultNumber);
      countUp.current.start();
    } else if (countUp.current !== null && el) {
      countUp.current.update(targetNumber);
      currentNumber.current = targetNumber;
    }
  }, [defaultNumber, targetNumber]);

  return <span ref={ref}>{currentNumber.current}</span>;
};

export default AnimatedNumbers;
