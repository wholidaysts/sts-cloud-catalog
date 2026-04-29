"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Catalog", href: "/" },
]

export function HeaderNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "border-b-2 px-3 py-5 text-sm font-medium transition-colors",
            pathname === item.href
              ? "border-tn-red text-tn-navy"
              : "border-transparent text-muted-foreground hover:text-tn-navy"
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}
