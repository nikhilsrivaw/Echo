"use client"

import { Button } from "@workspace/ui/components/button"
import { Authenticated, Unauthenticated, useMutation, useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import { SignInButton } from "@clerk/nextjs";
export default function Page() {
  const users = useQuery(api.users.getMany);
  const addUsers = useMutation(api.users.add);
  return (
    <>
      <Authenticated>
        <div className="flex items-center justify-center min-h-svh">
          <p>app/web</p>
          <Button onClick={() => addUsers()}>Add User</Button>
          <div className="max-w-sm w-full mx-auto">
            {JSON.stringify(users)}
          </div>

        </div>
      </Authenticated>
      <Unauthenticated>
        <p>must be signed in </p>
        <SignInButton>sign in </SignInButton>
      </Unauthenticated>
    </>

  )
}
