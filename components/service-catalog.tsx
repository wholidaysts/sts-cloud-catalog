"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import {
  CloudService,
  CloudProvider,
  SupportStatus,
  providerShortLabels,
} from "@/lib/types"
import { ServiceDetail } from "@/components/service-detail"
import { StatusBadge } from "@/components/status-badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Request failed")
  return res.json()
}

export function ServiceCatalog() {
  const { data: services, error, isLoading } = useSWR<CloudService[]>(
    "/api/services",
    fetcher
  )

  const [search, setSearch] = useState("")
  const [provider, setProvider] = useState<CloudProvider | "all">("all")
  const [status, setStatus] = useState<SupportStatus | "all">("all")
  const [category, setCategory] = useState<string>("all")
  const [selectedService, setSelectedService] = useState<CloudService | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const allServices = Array.isArray(services) ? services : []

  const categories = useMemo(() => {
    const set = new Set(allServices.map((s) => s.category))
    return Array.from(set).sort()
  }, [allServices])

  const filteredServices = useMemo(() => {
    return allServices.filter((service) => {
      const q = search.toLowerCase()
      const matchesSearch =
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q)
      const matchesProvider = provider === "all" || service.provider === provider
      const matchesStatus = status === "all" || service.status === status
      const matchesCategory = category === "all" || service.category === category
      return matchesSearch && matchesProvider && matchesStatus && matchesCategory
    })
  }, [allServices, search, provider, status, category])

  const handleServiceClick = (service: CloudService) => {
    setSelectedService(service)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={provider} onValueChange={(v) => setProvider(v as CloudProvider | "all")}>
            <SelectTrigger className="w-[130px] bg-secondary border-0">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="aws">AWS</SelectItem>
              <SelectItem value="azure">Azure</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => setStatus(v as SupportStatus | "all")}>
            <SelectTrigger className="w-[150px] bg-secondary border-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="fully-supported">Fully Supported</SelectItem>
              <SelectItem value="vendor-supported">Vendor Supported</SelectItem>
              <SelectItem value="not-supported">Not Supported</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px] bg-secondary border-0">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-border">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">Loading services...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-destructive">Failed to load services</p>
            <p className="text-xs text-muted-foreground/70">Check your database connection</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">No services found</p>
            <p className="text-xs text-muted-foreground/70">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredServices.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-secondary/50"
              >
                <StatusBadge status={service.status} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{service.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {providerShortLabels[service.provider]}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>

                <div className="hidden shrink-0 text-right sm:block">
                  <span className="rounded bg-secondary px-2 py-1 text-xs text-muted-foreground">
                    {service.category}
                  </span>
                </div>

                <Button variant="outline" size="sm" className="shrink-0">
                  View
                </Button>
              </button>
            ))}
          </div>
        )}
      </div>

      {!isLoading && !error && (
        <p className="text-xs text-muted-foreground">
          Showing {filteredServices.length} of {allServices.length} services
        </p>
      )}

      <ServiceDetail
        service={selectedService}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
