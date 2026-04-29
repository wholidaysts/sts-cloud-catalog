import { Header } from "@/components/header"
import { ServiceCatalog } from "@/components/service-catalog"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 border-l-4 border-tn-red pl-4">
          <h1 className="text-2xl font-semibold text-tn-navy">
            Cloud Services Catalog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AWS and Azure services supported by the STS Cloud Team
          </p>
        </div>
        <ServiceCatalog />
      </main>
    </div>
  )
}
