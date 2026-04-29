"use client"

import { useEffect, useState } from "react"
import {
  CloudService,
  CloudProvider,
  SupportStatus,
  statusLabels,
} from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"

type ServiceFormValues = Omit<CloudService, "id" | "lastUpdated">

interface ServiceFormProps {
  service?: CloudService | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (service: ServiceFormValues) => void
  submitting?: boolean
  categories: string[]
}

const emptyForm: ServiceFormValues = {
  name: "",
  provider: "aws",
  category: "Compute",
  status: "under-review",
  description: "",
  supportNotes: "",
  limitations: [],
  approvedUseCases: [],
  contactTeam: "",
  documentationUrl: null,
}

export function ServiceForm({
  service,
  open,
  onOpenChange,
  onSave,
  submitting,
  categories,
}: ServiceFormProps) {
  const isEditing = !!service

  const [formData, setFormData] = useState<ServiceFormValues>(emptyForm)
  const [limitationsText, setLimitationsText] = useState("")
  const [useCasesText, setUseCasesText] = useState("")

  useEffect(() => {
    if (open) {
      if (service) {
        setFormData({
          name: service.name,
          provider: service.provider,
          category: service.category,
          status: service.status,
          description: service.description,
          supportNotes: service.supportNotes,
          limitations: service.limitations,
          approvedUseCases: service.approvedUseCases,
          contactTeam: service.contactTeam,
          documentationUrl: service.documentationUrl,
        })
        setLimitationsText(service.limitations.join("\n"))
        setUseCasesText(service.approvedUseCases.join("\n"))
      } else {
        setFormData(emptyForm)
        setLimitationsText("")
        setUseCasesText("")
      }
    }
  }, [open, service])

  const splitLines = (text: string) =>
    text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      limitations: splitLines(limitationsText),
      approvedUseCases: splitLines(useCasesText),
      documentationUrl: formData.documentationUrl?.trim() || null,
    })
  }

  const categoryOptions = categories.length > 0 ? categories : [formData.category]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${service?.name}` : "Add New Service"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the service details below." : "Fill in the details to add a new cloud service."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Service Name</FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="provider">Provider</FieldLabel>
                <Select
                  value={formData.provider}
                  onValueChange={(value: CloudProvider) =>
                    setFormData({ ...formData, provider: value })
                  }
                >
                  <SelectTrigger id="provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aws">AWS</SelectItem>
                    <SelectItem value="azure">Azure</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  list="category-options"
                  required
                />
                <datalist id="category-options">
                  {categoryOptions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>

              <Field>
                <FieldLabel htmlFor="status">Support Status</FieldLabel>
                <Select
                  value={formData.status}
                  onValueChange={(value: SupportStatus) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="supportNotes">Support Notes</FieldLabel>
              <Textarea
                id="supportNotes"
                value={formData.supportNotes}
                onChange={(e) => setFormData({ ...formData, supportNotes: e.target.value })}
                rows={2}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="limitations">Limitations (one per line)</FieldLabel>
              <Textarea
                id="limitations"
                value={limitationsText}
                onChange={(e) => setLimitationsText(e.target.value)}
                rows={3}
                placeholder="Public buckets prohibited&#10;Encryption required for all data at rest"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="useCases">Approved Use Cases (one per line)</FieldLabel>
              <Textarea
                id="useCases"
                value={useCasesText}
                onChange={(e) => setUseCasesText(e.target.value)}
                rows={3}
                placeholder="Document storage&#10;Backups&#10;Static website hosting"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contactTeam">Contact Team</FieldLabel>
                <Input
                  id="contactTeam"
                  value={formData.contactTeam}
                  onChange={(e) => setFormData({ ...formData, contactTeam: e.target.value })}
                  placeholder="STS Cloud Team"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="documentationUrl">Documentation URL</FieldLabel>
                <Input
                  id="documentationUrl"
                  type="url"
                  value={formData.documentationUrl ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, documentationUrl: e.target.value })
                  }
                  placeholder="https://docs.aws.amazon.com/..."
                />
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : isEditing ? "Save Changes" : "Add Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
