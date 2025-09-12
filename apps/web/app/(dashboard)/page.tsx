"use client"

import { Button } from "@workspace/ui/components/button"
import {  useMutation, useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import { OrganizationSwitcher, SignInButton, UserButton } from "@clerk/nextjs";
export default function Page() {
  const users = useQuery(api.users.getMany);
  const addUsers = useMutation(api.users.add);
  return (
    <>
      
        <div className="flex items-center justify-center min-h-svh">
          <p>app/web</p>
          <UserButton/>
          <OrganizationSwitcher hidePersonal/>
          <Button onClick={() => addUsers()}>Add User</Button>
          

        </div>
      
    </>

  )
}
