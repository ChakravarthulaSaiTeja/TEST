"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SessionProvider } from "next-auth/react";

function TestAuthContent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
        
        {session ? (
          <div>
            <p className="mb-4">✅ You are signed in!</p>
            <p className="mb-2"><strong>Email:</strong> {session.user?.email}</p>
            <p className="mb-2"><strong>Name:</strong> {session.user?.name}</p>
            <p className="mb-4"><strong>ID:</strong> {(session.user as any)?.id}</p>
            
            <div className="space-x-4">
              <Button onClick={() => signOut()}>Sign Out</Button>
              <Button onClick={() => window.location.href = "/dashboard"}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4">❌ You are not signed in</p>
            <Button onClick={() => signIn("credentials", { 
              callbackUrl: "/dashboard",
              redirect: true 
            })}>
              Sign In with Credentials
            </Button>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Session Data:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function TestAuthPage() {
  return (
    <SessionProvider>
      <TestAuthContent />
    </SessionProvider>
  );
}
