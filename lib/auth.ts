import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

export const isAuthEnabled = Boolean(
  process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID,
)

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Provide a development-only secret if not set so preview doesn't crash.
  secret: process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me",
  providers: isAuthEnabled
    ? [
        MicrosoftEntraID({
          clientId: process.env.AZURE_AD_CLIENT_ID!,
          clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
          issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
        }),
      ]
    : [],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = (profile as { email?: string; preferred_username?: string }).email ?? token.email
        token.name = profile.name ?? token.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.email) session.user.email = token.email as string
        if (token.name) session.user.name = token.name as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
