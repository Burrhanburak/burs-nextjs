import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, CheckCircle, Shield, Bell } from "lucide-react"
import Logo from "@/components/Icon-logo"

export default async function HomePage() {
  const session = await auth()
  
  // If user is logged in, redirect them to dashboard
  if (session) {
    redirect("/dashboard")
  }
  
  // Otherwise show landing page for non-authenticated users
  return (
    <div className="flex flex-col min-h-screen relative">
      <main className="flex-1 overflow-y-auto">
        {/* Background gradients */}
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 opacity-40 hidden lg:block pointer-events-none">
          <div className="absolute -left-[25%] top-0 h-[300px] w-[600px] rotate-[20deg] rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-[100px]" />
          <div className="absolute right-0 top-1/4 h-[250px] w-[400px] rotate-[20deg] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 h-[300px] w-[600px] rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-[100px]" />
        </div>

        <section className="relative w-full pt-16 pb-12 md:pt-28 md:pb-20 lg:pt-32 lg:pb-28">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl relative z-10">
            <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-gray-200 bg-white/50 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Burs Başvuruları Açık
                </span>
                <div className="w-2 h-2 ml-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="flex items-center mb-8">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
              <Logo fillColor="white" color="white" className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Bursiyer</h1>
            </div>
              <div className="space-y-4 max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
                  Burs Başvurularında Yeni Dönem
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Modern ve kullanıcı dostu arayüzümüz ile burs başvurularınızı yapmak, takip etmek ve sonuçları öğrenmek artık çok daha kolay.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/auth/login">Giriş Yap</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href="/auth/signup">Hesap Oluştur</Link>
                </Button>
              </div>
            </div>
            
            <div className="mt-12 md:mt-16 lg:mt-20 relative max-w-4xl mx-auto">
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-xl transform rotate-3"></div>
              <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                {/* <Image
                  src="/images/hero.webp" 
                  alt="Burs Platformu Dashboard" 
                  width={1200} 
                  height={675}
                  className="w-full h-auto object-cover"
                  priority
                 
                /> */}
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <h3 className="text-xl font-semibold">Kullanıcı Dostu Arayüz</h3>
                    <p className="text-sm text-gray-300">Başvurularınızı kolayca takip edin ve yönetin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-10 md:py-20 bg-gray-50 dark:bg-gray-900/50 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <span className="text-sm font-medium">Özelliklerimiz</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
                Neden Bizi Tercih Etmelisiniz?
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
                Burs başvuru süreçlerinizi kolaylaştırmak için tasarlanmış benzersiz özelliklerimiz
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 mb-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Kolay Takip</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Başvurularınızı ve belgelerinizi tek bir yerden kolayca takip edin ve yönetin.
                </p>
                <div className="mt-5">
                  <Link href="/features" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                    Daha Fazla Bilgi
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 mb-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Güvenli Süreç</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Tüm başvuru ve belgeleriniz güvenle saklanır ve uçtan uca şifreleme ile korunur.
                </p>
                <div className="mt-5">
                  <Link href="/security" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                    Daha Fazla Bilgi
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 mb-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Anında Bildirimler</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Başvurunuzla ilgili tüm gelişmelerden anında haberdar olun ve önemli tarihleri kaçırmayın.
                </p>
                <div className="mt-5">
                  <Link href="/notifications" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                    Daha Fazla Bilgi
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-10 md:py-20 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Kullanıcı Deneyimleri
                </div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-gray-900 dark:text-white">
                  Öğrencilerimizin Gözünden
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Sistemimizi kullanan öğrencilerin deneyimlerini dinleyin
                </p>
              </div>
              <div className="grid gap-5">
                <div className="rounded-2xl bg-gray-50 p-5 shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 dark:text-gray-400">
                        &ldquo;Burs başvuru sürecim çok kolaylaştı. Artık tüm belgelerimi tek bir yerden yönetebiliyorum ve başvuru durumumu anında takip edebiliyorum.&rdquo;
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">Ayşe Yılmaz, İstanbul Üniversitesi</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-gray-50 p-5 shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 dark:text-gray-400">
                        &ldquo;Daha önce burs başvuruları yaparken çok zorlanıyordum. Bu platform sayesinde çok daha hızlı ve sorunsuz bir şekilde başvurularımı tamamlayabiliyorum.&rdquo;
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">Mehmet Kaya, ODTÜ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* <section className="w-full py-10 md:py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
                  Hemen Şimdi Başvurun
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Eğitim hayatınızı destekleyecek burs fırsatlarını kaçırmayın
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/auth/login">Giriş Yap</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href="/scholarships">Bursları Görüntüle</Link>
                </Button>
              </div>
            </div>
          </div>
        </section> */}
      </main>
      
      <footer className="w-full py-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
    
      </footer>
    </div>
  )
}

