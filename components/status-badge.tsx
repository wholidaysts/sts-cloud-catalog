import { SupportStatus, statusLabels } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: SupportStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs",
        className
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status === "fully-supported" && "bg-status-supported",
          status === "vendor-supported" && "bg-status-partial",
          status === "not-supported" && "bg-status-unsupported",
          status === "under-review" && "bg-status-review"
        )}
      />
      <span className="text-muted-foreground">{statusLabels[status]}</span>
    </span>
  )
}
