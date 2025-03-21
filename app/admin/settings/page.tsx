"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, FileText, CreditCard } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground">Sistem ayarlarını yönetin ve yapılandırın.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SettingsCard 
          title="Kullanıcı Yönetimi"
          description="Sistem kullanıcılarını yönetin"
          icon={<Users className="h-8 w-8 text-indigo-500" />}
          onClick={() => router.push("/admin/settings/users")}
        />
        
        <SettingsCard 
          title="Denetim Kayıtları"
          description="Sistem olay günlüklerini görüntüleyin"
          icon={<FileText className="h-8 w-8 text-emerald-500" />}
          onClick={() => router.push("/admin/settings/audit")}
        />
        
        <SettingsCard 
          title="Fatura ve Abonelik"
          description="Ödeme bilgilerinizi yönetin"
          icon={<CreditCard className="h-8 w-8 text-amber-500" />}
          onClick={() => router.push("/admin/settings/billing")}
        />
      </div>
    </div>
  )
}

interface SettingsCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}

function SettingsCard({ title, description, icon, onClick }: SettingsCardProps) {
  return (
    <Card className="hover:border-primary hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xl">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{description}</CardDescription>
        <Button 
          variant="outline" 
          className="w-full group"
          onClick={onClick}
        >
          Görüntüle
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  )
} 