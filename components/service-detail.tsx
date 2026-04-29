"use client"

import { CloudService, providerShortLabels } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/status-badge"
import { ExternalLink } from "lucide-react"

interface ServiceDetailProps {
  service: CloudService | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ServiceDetail({ service, open, onOpenChange }: ServiceDetailProps) {
  if (!service) return null

  const formattedDate = (() => {
    try {
      return new Date(service.lastUpdated).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return service.lastUpdated
    }
  })()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{providerShortLabels[service.provider]}</span>
            <span>·</span>
            <span>{service.category}</span>
          </div>
          <DialogTitle className="text-lg font-medium">{service.name}</DialogTitle>
          <DialogDescription className="sr-only">
            Details for {service.name} cloud service
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status={service.status} />
          </div>

          <p className="text-sm text-foreground leading-relaxed">{service.description}</p>
        </div>

        <div className="border-t border-border px-6 py-4 space-y-4">
          {service.supportNotes && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Support Notes
              </h4>
              <p className="text-sm text-foreground">{service.supportNotes}</p>
            </div>
          )}

          {service.limitations.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Limitations
              </h4>
              <ul className="list-disc pl-4 space-y-1">
                {service.limitations.map((item, idx) => (
                  <li key={idx} className="text-sm text-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {service.approvedUseCases.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Approved Use Cases
              </h4>
              <ul className="list-disc pl-4 space-y-1">
                {service.approvedUseCases.map((item, idx) => (
                  <li key={idx} className="text-sm text-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Support Contact
            </h4>
            <p className="text-sm text-foreground">{service.contactTeam}</p>
          </div>

          {service.documentationUrl && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Documentation
              </h4>
              <a
                href={service.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-foreground hover:underline"
              >
                View official docs
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
          Updated {formattedDate}
        </div>
      </DialogContent>
    </Dialog>
  )
}
