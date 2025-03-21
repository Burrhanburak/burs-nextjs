"use client"

import { Button } from "@/components/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard"
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      // Attempt to sign in with credentials
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        console.log("Invalid credentials")
        return
      }

      // Check if the user is an admin
      const user = await fetch("/api/users/me").then((res) => res.json())

      if (user && user.role === "admin") {
        // Redirect the admin user to the specified callback URL
        router.push(callbackUrl)
      } else {
        console.log("Access denied. Admin only.")
        // Sign out the non-admin user
        await signIn("credentials", { redirect: false, action: "signout" })
      }

      router.refresh()
    } catch (e) {
      console.error("An error occurred:", e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative flex h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Girişi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 