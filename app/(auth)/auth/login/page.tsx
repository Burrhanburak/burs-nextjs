import { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/LoginForm"
import Logo from "@/components/Icon-logo"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage() {
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
                {/* <svg
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
                </svg> */}
                <Logo />
              </div>
              <h1 className="text-2xl font-bold text-white">Bursiyer</h1>
            </div>
            
            <div className="hidden lg:flex flex-col justify-center flex-grow">
              <h2 className="text-3xl font-bold text-white mb-6">Burs Başvuru <br/>Portalına Hoş Geldiniz</h2>
              <p className="text-white/80 mb-8">Tek bir platform üzerinden burs başvurularınızı yönetin, belgelerinizi yükleyin ve başvuru durumunuzu takip edin.</p>
            </div>
            
            <div className="hidden lg:block mt-auto">
              <blockquote className="p-4 border-l-4 border-white/30 bg-white/10 rounded-lg">
                <p className="text-white mb-2">
                  &ldquo;Bu platform sayesinde burs başvurularımı kolayca yönetebiliyorum.&rdquo;
                </p>
                <footer className="text-white/70 text-sm font-medium">Sofia Davis, Öğrenci</footer>
              </blockquote>
            </div>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="lg:w-1/2 p-8 md:p-12">
       
          <div className="max-w-md mx-auto">
          
            <div className="mb-8 text-center">
            
              <h2 className="text-2xl font-bold text-blue-500 dark:text-white mb-2">
                Hesabınıza Giriş Yapın
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Email adresiniz ve şifreniz ile giriş yapabilirsiniz
              </p>
            </div>
            
            <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
              <LoginForm />
            </Suspense>
            
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-850 text-gray-500 dark:text-gray-400">
                    veya
                  </span>
                </div>
              </div>
              
              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Hesabınız yok mu?{" "}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-blue-600 hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-100"                >
                  Hemen kayıt olun
                </Link>
              </p>
             
        
            </div>
          
          </div>
        </div>
      </div>
    </div>
  )
} 
