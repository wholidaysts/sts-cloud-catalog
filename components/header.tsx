import Link from "next/link"
import Image from "next/image"
import { auth, signOut, isAuthEnabled } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { HeaderNav } from "./header-nav"

export async function Header() {
  const session = await auth()

  return (
    <header className="border-b border-border bg-card">
      {/* Top accent bar with TN colors */}
      <div className="h-1 w-full bg-tn-navy" />
      <div className="h-0.5 w-full bg-tn-red" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/tn-tristar.jpg"
              alt="Tennessee Tri-Star"
              width={36}
              height={36}
              className="rounded-full"
              priority
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                State of Tennessee
              </span>
              <span className="text-sm font-semibold text-tn-navy">
                STS Cloud Services Catalog
              </span>
            </div>
          </Link>

          <HeaderNav />
        </div>

        <div className="flex items-center gap-3">
          {isAuthEnabled && session?.user ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {session.user.email}
              </span>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/login" })
                }}
              >
                <Button variant="ghost" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : isAuthEnabled ? (
            <Link href="/login">
              <Button size="sm" className="bg-tn-navy text-primary-foreground hover:bg-tn-navy/90">
                Sign in
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}
