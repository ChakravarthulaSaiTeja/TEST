import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../options"

interface ExtendedSession {
  user?: {
    email?: string | null
    name?: string | null
  }
  provider?: string
  providerAccountId?: string
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    const extendedSession = session as ExtendedSession
    if (!extendedSession || !extendedSession.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, name, provider, provider_id } = {
      email: extendedSession.user?.email,
      name: extendedSession.user?.name,
      provider: extendedSession.provider,
      provider_id: extendedSession.providerAccountId
    }

    // Call FastAPI backend to exchange OAuth token for JWT
    const response = await fetch(`${process.env.FASTAPI_URL || 'http://localhost:8000'}/api/v1/auth/oauth-exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        provider,
        provider_id
      }),
    })

    if (!response.ok) {
      throw new Error('Backend exchange failed')
    }

    const data = await response.json()
    const { access_token, refresh_token, user } = data

    // Set HttpOnly cookies for the JWT tokens
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }

    const responseWithCookies = NextResponse.json({ user })
    
    responseWithCookies.cookies.set("ti_access", access_token, cookieOptions)
    responseWithCookies.cookies.set("ti_refresh", refresh_token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30, // 30 days for refresh token
    })

    return responseWithCookies
  } catch (error) {
    console.error("Token exchange error:", error)
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 500 }
    )
  }
}
