"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { PhoneInput } from "@/components/phone-input"

// TC Kimlik validation regex
const tcKimlikRegex = /^[1-9]{1}[0-9]{10}$/

const signUpFormSchema = z
  .object({
    tcKimlikNo: z.string().regex(tcKimlikRegex, {
      message: "TC Kimlik numarası 11 haneli olmalı ve 0 ile başlamamalıdır.",
    }),
    firstName: z.string().min(2, {
      message: "İsim en az 2 karakter olmalıdır.",
    }),
    lastName: z.string().min(2, {
      message: "Soyisim en az 2 karakter olmalıdır.",
    }),
    email: z.string().email({
      message: "Geçerli bir e-posta adresi giriniz.",
    }),
    mobilePhone: z.string().min(10, {
      message: "Geçerli bir telefon numarası giriniz.",
    }),
    password: z.string().min(8, {
      message: "Şifre en az 8 karakter olmalıdır.",
    }),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "Kullanım koşullarını kabul etmelisiniz.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  })

type SignUpFormValues = z.infer<typeof signUpFormSchema>

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      tcKimlikNo: "",
      firstName: "",
      lastName: "",
      email: "",
      mobilePhone: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  })

  async function onSubmit() {
    setIsLoading(true)

    try {
      // Register the user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.getValues()),
      })

      // Handle specific HTTP error codes first
      if (registerResponse.status === 409) {
        const error = await registerResponse.json()
        toast.error(
          <div className="flex flex-col gap-2">
            <p>{error.error || "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut."}</p>
            <div className="flex items-center justify-end mt-1">
              <Button 
                variant="link" 
                className="p-0 h-auto text-white underline" 
                onClick={() => router.push('/auth/login')}
              >
                Giriş sayfasına git
              </Button>
            </div>
          </div>,
          {
            duration: 5000,
            className: 'border-red-500'
          }
        )
        setIsLoading(false)
        return
      }

      if (!registerResponse.ok) {
        const error = await registerResponse.json()
        throw new Error(error.error || "Kayıt sırasında bir hata oluştu")
      }

      // Send verification email
      const verifyResponse = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.getValues().email }),
      })

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json()
        throw new Error(error.error || "Doğrulama e-postası gönderilirken bir hata oluştu")
      }

      toast.success("Hesabınız oluşturuldu. Lütfen e-posta adresinizi doğrulayın.")

      // Redirect to verify page
      router.push(`/auth/verify?email=${encodeURIComponent(form.getValues().email)}`)
    } catch (error: unknown) {
      console.error("Registration error:", error)
      const errorMessage = error instanceof Error ? error.message : "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="tcKimlikNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TC Kimlik No</FormLabel>
                <FormControl>
                  <Input placeholder="TC Kimlik numaranızı giriniz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad</FormLabel>
                  <FormControl>
                    <Input placeholder="Adınız" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soyad</FormLabel>
                  <FormControl>
                    <Input placeholder="Soyadınız" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-posta</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="mobilePhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <PhoneInput
                    placeholder="Telefon numaranız"
                    {...field}
                    defaultCountry="TR"
                  />
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
                  <Input placeholder="********" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şifre (Tekrar)</FormLabel>
                <FormControl>
                  <Input placeholder="********" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Kullanım koşullarını ve gizlilik politikasını kabul ediyorum
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-600" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
              <span>Kaydediliyor...</span>
            </div>
          ) : (
            "Hesap Oluştur"
          )}
        </Button>
      </form>
    </Form>
  )
}

