'use client';

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  email: z.string().email({
    message: "Geçerli bir email adresi giriniz.",
  }),
  password: z.string().min(1, {
    message: "Şifre alanı boş bırakılamaz.",
  }),
})

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Get URL parameters
      const params = new URLSearchParams(window.location.search)
      const callbackUrl = params.get('callbackUrl') || '/user/dashboard'
      
      console.log("Callback URL:", callbackUrl)
      
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        toast("Email veya şifre hatalı")
        setIsLoading(false)
        return
      }

      // Fetch user session to get role
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      
      // Debug logs
      console.log("Session data:", session)
      console.log("User role:", session?.user?.role)
      
      // First set loading to false before navigation
      setIsLoading(false)
      
      // Add a small delay before navigation to allow state updates to complete
      setTimeout(() => {
        console.log("Redirecting based on role:", session?.user?.role)
        if (session?.user?.role === 'ADMIN') {
          console.log("Redirecting to admin dashboard")
          if (callbackUrl.startsWith('/admin')) {
            window.location.href = callbackUrl
          } else {
            window.location.href = "/admin/dashboard"
          }
        } else {
          console.log("Redirecting to user dashboard")
          window.location.href = "/user/dashboard"
        }
      }, 100)
    } catch {
      toast("Bir hata oluştu")
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="ornek@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şifre</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-blue-500" disabled={isLoading}>
          {isLoading ? "Giriş yapılıyor..." : "Giriş yap"}
        </Button>
      </form>
    </Form>
  )
} 