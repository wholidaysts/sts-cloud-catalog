export type CloudProvider = "aws" | "azure"

export type SupportStatus =
  | "fully-supported"
  | "vendor-supported"
  | "not-supported"
  | "under-review"

export interface CloudService {
  id: string
  name: string
  provider: CloudProvider
  category: string
  status: SupportStatus
  description: string
  supportNotes: string
  limitations: string[]
  approvedUseCases: string[]
  contactTeam: string
  documentationUrl: string | null
  lastUpdated: string
}

export const statusLabels: Record<SupportStatus, string> = {
  "fully-supported": "Fully Supported",
  "vendor-supported": "Vendor Supported",
  "not-supported": "Not Supported",
  "under-review": "Under Review",
}

export const providerLabels: Record<CloudProvider, string> = {
  aws: "Amazon Web Services",
  azure: "Microsoft Azure",
}

export const providerShortLabels: Record<CloudProvider, string> = {
  aws: "AWS",
  azure: "Azure",
}
