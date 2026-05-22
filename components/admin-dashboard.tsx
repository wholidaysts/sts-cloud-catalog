"use client"

import { useState, useMemo } from "react"
import useSWR, { mutate } from "swr"
import Image from "next/image"
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
                        <span className="font-medium text-foreground">{service.name}</span>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Image
                            src={service.provider === "AWS" ? "/logos/aws-logo.png" : "/logos/azure-logo.png"}
                            alt={service.provider}
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                          <span>{providerShortLabels[service.provider]}</span>
                        </div>
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
