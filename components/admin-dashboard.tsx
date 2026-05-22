"use client"

import { useState, useMemo } from "react"
import useSWR, { mutate } from "swr"
import { CloudService, statusLabels, providerShortLabels } from "@/lib/types"
import { ServiceForm } from "@/components/service-form"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Request failed")
  return res.json()
}

// Provider logo components
function AwsLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 256 153" xmlns="http://www.w3.org/2000/svg">
      <path d="M72.392 55.438c0 3.137-.403 5.69-1.165 7.66-.807 1.97-1.925 3.985-3.445 6-1.075 1.343-3.356 3.715-6.842 7.12l-10.152-8.373c2.017-1.702 3.535-3.09 4.61-4.208 1.12-1.12 1.97-2.195 2.642-3.27.673-1.12 1.031-2.284 1.031-3.537 0-1.522-.583-2.821-1.747-3.895-1.165-1.075-2.687-1.612-4.61-1.612-2.015 0-3.67.627-4.967 1.88-1.298 1.253-1.97 2.866-1.97 4.789 0 1.478.27 2.955.852 4.387.538 1.478 1.567 3.402 3.044 5.773l-9.3 7.703c-2.597-3.85-4.52-7.031-5.773-9.524-1.253-2.493-1.88-5.059-1.88-7.66 0-5.058 1.925-9.346 5.728-12.864 3.805-3.52 8.552-5.281 14.244-5.281 5.773 0 10.61 1.746 14.512 5.237 3.805 3.492 5.729 7.884 5.729 13.193m13.193 16.461c-5.103 0-9.3-1.567-12.55-4.7-3.268-3.134-4.879-7.21-4.879-12.222 0-5.817 1.88-10.52 5.639-14.065 3.76-3.537 8.685-5.327 14.78-5.327 5.684 0 10.33 1.701 13.952 5.104 3.626 3.402 5.416 7.838 5.416 13.283 0 5.057-1.612 9.301-4.834 12.775-3.178 3.446-7.837 5.148-13.953 5.148m.224-28.252c-2.821 0-5.148 1.031-6.978 3.09-1.835 2.06-2.732 4.61-2.732 7.613 0 2.955.897 5.416 2.732 7.388 1.835 2.016 4.157 3.001 6.933 3.001 2.776 0 5.014-.94 6.708-2.866 1.701-1.925 2.552-4.476 2.552-7.612 0-3.09-.851-5.595-2.552-7.524-1.7-1.97-3.94-2.955-6.663-2.955m36.177 27.848V47.285h12.639c6.095 0 10.834 1.388 14.154 4.118 3.313 2.776 4.97 6.707 4.97 11.856 0 5.639-1.97 10.017-5.908 13.13-3.939 3.115-9.481 4.653-16.594 4.653H121.94m11.722-9.793h2.015c3.179 0 5.595-.806 7.21-2.418 1.613-1.612 2.418-3.85 2.418-6.753 0-2.463-.717-4.476-2.195-6.006-1.477-1.522-3.626-2.283-6.484-2.283h-3.001v17.422m47.077 9.793V35.689H192v11.856h-11.26v23.947h-11.26M224.653 47.285h11.257v24.22h-11.257v-24.22m0-11.596h11.257v8.999h-11.257v-9m26.913 35.816V47.285h10.834l9.57 15.362 9.525-15.362h10.834v24.22h-11.258V55.84l-9.12 15.72-9.076-15.72v15.664h-11.26" fill="#252F3E"/>
      <g fill="#FF9900">
        <path d="M104.105 144.394c-15.05 11.08-36.885 17.008-55.684 17.008-26.355 0-50.108-9.747-68.028-25.94-1.431-1.298-.09-3.043 1.567-2.06 19.577 11.437 43.779 18.265 68.789 18.265 16.863 0 35.39-3.492 52.444-10.742 2.552-1.12 4.7 1.701 2.239 3.492"/>
        <path d="M110.513 137.084c-1.925-2.463-12.773-1.165-17.652-.583-1.477.178-1.701-1.12-.403-2.06 8.641-6.095 22.839-4.342 24.487-2.284 1.612 2.016-.448 16.058-8.417 22.794-1.21 1.031-2.418.493-1.88-.896 1.835-4.61 5.908-14.961 3.984-17.424"/>
      </g>
    </svg>
  )
}

function AzureLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="azure-grad" x1="58.972%" x2="37.217%" y1="7.411%" y2="103.772%">
          <stop offset="0%" stopColor="#114A8B"/>
          <stop offset="100%" stopColor="#0669BC"/>
        </linearGradient>
      </defs>
      <path fill="url(#azure-grad)" d="M119.387 105.82L70.916 207.61l83.48 14.394c5.029.867 10.126.867 15.156 0l80.16-13.832-129.69-102.35.365-.002zm83.633-5.912h63.381l-74.854-96.74a21.253 21.253 0 0 0-33.768 0L.5 217.641l62.653-10.813 51.59-106.92h88.277z"/>
    </svg>
  )
}

export function AdminDashboard() {
  const { data: services, isLoading } = useSWR<CloudService[]>(
    "/api/services",
    fetcher
  )

  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<CloudService | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CloudService | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const allServices = Array.isArray(services) ? services : []

  const filteredServices = useMemo(() => {
    return allServices.filter((service) =>
      service.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [allServices, search])

  const stats = useMemo(
    () => ({
      total: allServices.length,
      supported: allServices.filter((s) => s.status === "fully-supported").length,
      partial: allServices.filter((s) => s.status === "vendor-supported").length,
      unsupported: allServices.filter((s) => s.status === "not-supported").length,
      review: allServices.filter((s) => s.status === "under-review").length,
      aws: allServices.filter((s) => s.provider === "AWS").length,
      azure: allServices.filter((s) => s.provider === "Azure").length,
    }),
    [allServices]
  )

  const handleEdit = (service: CloudService) => {
    setEditingService(service)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/services/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      await mutate("/api/services")
    } catch (err) {
      console.error("[v0] Delete failed:", err)
    } finally {
      setSubmitting(false)
      setDeleteTarget(null)
    }
  }

  const handleSave = async (data: Omit<CloudService, "id" | "lastUpdated">) => {
    setSubmitting(true)
    try {
      if (editingService) {
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Update failed")
      } else {
        const res = await fetch(`/api/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Create failed")
      }
      await mutate("/api/services")
      setEditingService(null)
      setFormOpen(false)
    } catch (err) {
      console.error("[v0] Save failed:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddNew = () => {
    setEditingService(null)
    setFormOpen(true)
  }

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Provider",
      "Category",
      "Status",
      "Description",
      "Support Notes",
      "Limitations",
      "Approved Use Cases",
      "Contact Team",
      "Documentation URL",
      "Last Updated",
    ]
    const rows = allServices.map((s) => [
      s.name,
      providerShortLabels[s.provider],
      s.category,
      statusLabels[s.status],
      s.description,
      s.supportNotes,
      s.limitations.join("; "),
      s.approvedUseCases.join("; "),
      s.contactTeam,
      s.documentationUrl ?? "",
      s.lastUpdated,
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cloud-services-catalog.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="services">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="bg-secondary">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-1.5 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={handleAddNew}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Service
            </Button>
          </div>
        </div>

        <TabsContent value="services" className="mt-6 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-0"
            />
          </div>

          <div className="rounded-lg border border-border">
            {isLoading ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Loading services...
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">Provider</th>
                    <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium w-[50px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-secondary/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {service.provider === "AWS" ? (
                            <AwsLogo className="h-5 w-5 flex-shrink-0" />
                          ) : (
                            <AzureLogo className="h-5 w-5 flex-shrink-0" />
                          )}
                          <span className="font-medium text-foreground">{service.name}</span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                        {providerShortLabels[service.provider]}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                        {service.category}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={service.status} />
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(service)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(service)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {filteredServices.length} services
          </p>
        </TabsContent>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Total Services</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Fully Supported</p>
              <p className="mt-1 text-2xl font-semibold text-status-supported">{stats.supported}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Under Review</p>
              <p className="mt-1 text-2xl font-semibold text-status-review">{stats.review}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Not Supported</p>
              <p className="mt-1 text-2xl font-semibold text-status-unsupported">{stats.unsupported}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground mb-3">By Provider</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">AWS</span>
                  <span className="text-sm font-medium text-foreground">{stats.aws}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-chart-2"
                    style={{ width: stats.total ? `${(stats.aws / stats.total) * 100}%` : "0%" }}
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-foreground">Azure</span>
                  <span className="text-sm font-medium text-foreground">{stats.azure}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-chart-3"
                    style={{ width: stats.total ? `${(stats.azure / stats.total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground mb-3">By Status</p>
              <div className="space-y-2">
                {[
                  { label: "Fully Supported", value: stats.supported, color: "bg-status-supported" },
                  { label: "Vendor Supported", value: stats.partial, color: "bg-status-partial" },
                  { label: "Under Review", value: stats.review, color: "bg-status-review" },
                  { label: "Not Supported", value: stats.unsupported, color: "bg-status-unsupported" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="flex-1 text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ServiceForm
        service={editingService}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingService(null)
        }}
        onSave={handleSave}
        submitting={submitting}
        categories={Array.from(new Set(allServices.map((s) => s.category))).sort()}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteTarget?.name}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
