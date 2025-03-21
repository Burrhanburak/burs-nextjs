"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"
import { RiCalendarLine, RiArrowRightLine } from "@remixicon/react"

interface Scholarship {
  id: string
  title: string
  description: string
  requirements: string
  deadline: string
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/scholarships")
        if (!response.ok) {
          throw new Error("Burs programları alınırken bir hata oluştu")
        }
        const data = await response.json()
        setScholarships(data)
      } catch (error) {
        console.error("Burs programları getirme hatası:", error)
        toast.error("Burs programları yüklenirken bir hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    fetchScholarships()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary mx-auto mb-3"></div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Burs programları yükleniyor...
          </div>
        </div>
      </div>
    )
  }

  if (scholarships.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Burs Programları</h1>
          <p className="text-muted-foreground">
            Şu anda aktif burs programı bulunmamaktadır.
          </p>
        </div>
        
        <Separator />
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <RiCalendarLine className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">Aktif Program Bulunamadı</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Şu anda başvurabileceğiniz aktif bir burs programı bulunmamaktadır. Lütfen daha sonra tekrar kontrol ediniz.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Burs Programları</h1>
        <p className="text-muted-foreground">
          Başvurabileceğiniz aktif burs programlarını aşağıda görebilirsiniz.
        </p>
      </div>
      
      <Separator />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {scholarships.map((scholarship) => (
          <Card key={scholarship.id} className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>{scholarship.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {scholarship.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <RiCalendarLine className="mr-2 h-4 w-4" />
                  <span>Son Başvuru: {format(new Date(scholarship.deadline), "d MMMM yyyy", { locale: tr })}</span>
                </div>
                <div className="text-sm">
                  <h4 className="font-medium mb-1">Gereksinimler</h4>
                  <p className="text-muted-foreground line-clamp-3">
                    {scholarship.requirements}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Link href={`/scholarships/${scholarship.id}`}>
                <Button variant="outline">Detayları Gör</Button>
              </Link>
              <Link href={`/scholarships/apply?id=${scholarship.id}`}>
                <Button className="flex items-center">
                  <span className="mr-1">Başvur</span>
                  <RiArrowRightLine className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 