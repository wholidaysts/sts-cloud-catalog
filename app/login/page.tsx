import Image from "next/image"
import { signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image
              src="/tn-tristar.jpg"
              alt="Tennessee State Government"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
          <CardTitle className="text-tn-navy">
            Cloud Services Catalog
          </CardTitle>
          <CardDescription>
            State of Tennessee &middot; STS Cloud Team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server"
              await signIn("microsoft-entra-id", { redirectTo: "/" })
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              <svg
                className="mr-2 h-5 w-5"
                viewBox="0 0 23 23"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
                <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
                <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
              </svg>
              Sign in with Microsoft
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Use your State of Tennessee credentials to sign in.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
