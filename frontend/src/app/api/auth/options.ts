/* eslint-disable @typescript-eslint/no-explicit-any */
// NextAuth configuration
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"

// Debug environment variables
console.log("NextAuth Environment Variables:", {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
  GITHUB_ID: process.env.GITHUB_ID ? "SET" : "NOT SET",
});

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "placeholder",
      clientSecret: process.env.GITHUB_SECRET || "placeholder",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
        token.isNewSession = true
      }
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }: any) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      session.accessToken = token.accessToken as string
      session.provider = token.provider as string
      session.providerAccountId = token.providerAccountId as string
      
      // Backend exchange removed for now to simplify authentication flow
      
      return session
    },
    async signIn() {
      // Allow sign in
      return true
    },
  },
  // Custom pages removed - using default NextAuth pages
}
