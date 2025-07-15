// v0.0.01 salah
import { ReactElement, useState } from "react";

export function useMultistepForm(steps: ReactElement[]) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  function next() {
    setCurrentStepIndex((i) => {
      if (i >= steps.length - 1) return i;
      return i + 1;
    });
  }

  function back() {
    setCurrentStepIndex((i) => {
      if (i <= 0) return i;
      return i - 1;
    });
  }

  function goTo(index: number) {
    setCurrentStepIndex(index);
  }

  const isFstep = currentStepIndex === 0;
  const isLstep = currentStepIndex === steps.length - 1;

  return {
    currentStepIndex,
    step: steps[currentStepIndex],
    goTo,
    next,
    back,
    steps,
    isFstep,
    isLstep,
  };
}
