import { Header } from "@/components/header"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 border-l-4 border-tn-red pl-4">
          <h1 className="text-2xl font-semibold text-tn-navy">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage cloud services catalog entries
          </p>
        </div>
        <AdminDashboard />
      </main>
    </div>
  )
}
