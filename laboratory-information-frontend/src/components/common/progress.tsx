import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";


import { cn } from "./utils";

function Progress({
  className,
  value,
  size = "md",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { size?: "sm" | "md" | "lg" }) {
  const heights = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  } as const;

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        `bg-gray-200/60 relative w-full overflow-hidden rounded-full shadow-sm ${heights[size]}`,
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-blue-600 h-full w-full flex-1 transition-all ease-linear"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
