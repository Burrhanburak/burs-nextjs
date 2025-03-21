"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Mail, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const [tokenChecked, setTokenChecked] = useState(false)
  const [isResending, setIsResending] = useState(false)

  // Get email from URL and set it
  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  // Check for token in the URL
  useEffect(() => {
    const token = searchParams.get("token")
    if (token) {
      verifyWithToken(token)
    } else {
      setTokenChecked(true)
    }
  }, [searchParams])

  // Verify with token
  const verifyWithToken = async (token: string) => {
    setIsVerifying(true)
    setError("")
    
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setIsVerified(true)
        toast.success("E-posta adresiniz başarıyla doğrulandı!")
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      } else {
        setError(data.error || "Doğrulama sırasında bir hata oluştu.")
        toast.error(data.error || "Doğrulama sırasında bir hata oluştu.")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.")
      toast.error("Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsVerifying(false)
      setTokenChecked(true)
    }
  }

  // Verify with code
  const handleVerifyWithCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !verificationCode) {
      toast.error("E-posta ve doğrulama kodu gereklidir.")
      return
    }
    
    setIsVerifying(true)
    setError("")
    
    try {
      const response = await fetch(`/api/auth/verify-email?code=${verificationCode}&email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setIsVerified(true)
        toast.success("E-posta adresiniz başarıyla doğrulandı!")
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      } else {
        setError(data.error || "Doğrulama sırasında bir hata oluştu.")
        toast.error(data.error || "Doğrulama sırasında bir hata oluştu.")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.")
      toast.error("Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsVerifying(false)
    }
  }

  // Resend verification email
  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Lütfen e-posta adresinizi girin.")
      return
    }
    
    setIsResending(true)
    
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success("Doğrulama e-postası gönderildi. Lütfen gelen kutunuzu kontrol edin.")
      } else {
        toast.error(data.error || "E-posta gönderimi sırasında bir hata oluştu.")
      }
    } catch (error) {
      console.error("Error resending email:", error)
      toast.error("E-posta gönderimi sırasında bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsResending(false)
    }
  }

  if (isVerifying && !tokenChecked) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Doğrulanıyor...</h2>
          <p className="text-muted-foreground">Lütfen bekleyin, hesabınız doğrulanıyor.</p>
        </div>
      </div>
    )
  }

  if (isVerified) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Doğrulama Başarılı!</CardTitle>
            <CardDescription>E-posta adresiniz başarıyla doğrulandı.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>Artık hesabınıza giriş yapabilirsiniz. Giriş sayfasına yönlendiriliyorsunuz...</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/auth/login">Giriş Yap</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Doğrulama Hatası</CardTitle>
            <CardDescription>E-posta doğrulama sırasında bir hata oluştu.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <p>Yeni bir doğrulama kodu almak için aşağıdaki forma e-posta adresinizi girin.</p>
            <form className="mt-4 space-y-4">
              <Input 
                type="email" 
                placeholder="E-posta adresiniz" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <Button 
                type="button" 
                className="w-full" 
                onClick={handleResendEmail}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  "Yeni Doğrulama Kodu Gönder"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Giriş Sayfasına Dön</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-850 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
        {/* Left side - Image and branding */}
        <div className="lg:w-1/2 relative">
          <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-800">
            <div className="absolute inset-0 opacity-20 bg-[url('/images/pattern.svg')] bg-repeat"></div>
          </div>
          <div className="relative z-10 h-full p-8 flex flex-col">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-white"
                >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Bursiyer</h1>
            </div>
            
            <div className="hidden lg:flex flex-col justify-center flex-grow">
              <h2 className="text-3xl font-bold text-white mb-6">E-posta<br/>Doğrulaması</h2>
              <p className="text-white/80 mb-8">Hesabınızı kullanmaya başlamak için lütfen e-posta adresinizi doğrulayın.</p>
            </div>
            
            <div className="hidden lg:block mt-auto">
              <div className="p-4 border-l-4 border-white/30 bg-white/10 rounded-lg">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <p className="text-white">
                    Size gönderilen doğrulama e-postasını bulamıyor musunuz? 
                    Lütfen spam ve önemsiz klasörlerini kontrol edin veya 
                    "Tekrar Gönder" butonunu kullanın.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Verification form */}
        <div className="lg:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="mb-8 text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 inline-flex mb-4">
                <Mail className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
              <h2 className="text-2xl font-bold text-blue-500 dark:text-white mb-2">
                E-posta Doğrulama
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                E-posta adresinize gönderilen 6 haneli doğrulama kodunu girin
              </p>
            </div>
            
            <form onSubmit={handleVerifyWithCode} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-posta Adresi
                </label>
                <Input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Doğrulama Kodu
                </label>
                <Input 
                  id="code"
                  type="text" 
                  value={verificationCode} 
                  onChange={(e) => setVerificationCode(e.target.value)} 
                  required 
                  maxLength={6}
                  className="text-center text-lg tracking-widest bg-gray-50 dark:bg-gray-800"
                  placeholder="○○○○○○"
                />
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm text-amber-800 dark:text-amber-300">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>E-posta gelmedi mi? Spam ve junk klasörlerini kontrol edin veya yeni bir doğrulama kodu isteyebilirsiniz.</p>
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Doğrulanıyor...
                  </>
                ) : (
                  "Doğrula"
                )}
              </Button>
              
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-850 text-gray-500 dark:text-gray-400">
                    veya
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendEmail}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  "Yeni Kod Gönder"
                )}
              </Button>
            </form>
            
            <div className="mt-8 text-sm text-center">
              <span className="text-muted-foreground">Giriş yapmak mı istiyorsunuz? </span>
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link href="/auth/login">Giriş Yap</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 