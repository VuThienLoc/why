import { cn } from "@/components/common/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
  className={cn(
    "relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700",
    className
  )}
  {...props}
>
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
</div>

  )
}

export { Skeleton }
