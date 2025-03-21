"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface Scholarship {
  id: string
  title: string
  deadline: string
}

interface ApplicationData {
  applicationId?: string
  notes: string
  customScholarship?: string
}

export default function CreateApplicationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [selectedScholarship, setSelectedScholarship] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [scholarshipTitle, setScholarshipTitle] = useState("")
  
  // Form verileri
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    nationality: "",
    profession: "",
    university: "",
    department: "",
    grade: "",
    gpa: "",
    otherScholarship: false,
    otherScholarshipDetails: "",
    additionalInfo: "",
  })

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/users/me")
        if (!response.ok) {
          throw new Error("Kullanıcı bilgileri alınamadı")
        }
        
        const userData = await response.json()
        
        // Kullanıcı verisiyle formu doldur
        setFormData(prev => ({
          ...prev,
          name: userData.name || "",
          birthDate: userData.birthDate || "",
          nationality: userData.nationality || "",
          profession: userData.profession || "",
          university: userData.university || "",
          department: userData.department || "",
          grade: userData.grade || "",
          gpa: userData.gpa || "",
          otherScholarship: userData.otherScholarship || false,
          otherScholarshipDetails: userData.otherScholarshipDetails || "",
        }))
      } catch (error) {
        console.error("Kullanıcı bilgileri yüklenirken hata:", error)
      }
    }
    
    fetchUserData()
  }, [])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      otherScholarship: checked,
      otherScholarshipDetails: checked ? prev.otherScholarshipDetails : ""
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedScholarship && selectedScholarship !== "custom") {
      toast.error("Lütfen bir burs programı seçin")
      return
    }
    
    if (!termsAccepted) {
      toast.error("Devam etmek için şartları ve koşulları kabul etmelisiniz")
      return
    }

    try {
      setIsSubmitting(true)
      
      // Kullanıcı bilgilerini güncelle
      const userResponse = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          birthDate: formData.birthDate,
          nationality: formData.nationality,
          profession: formData.profession,
          university: formData.university,
          department: formData.department,
          grade: formData.grade,
          gpa: formData.gpa,
          otherScholarship: formData.otherScholarship,
          otherScholarshipDetails: formData.otherScholarshipDetails,
        }),
      })
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json().catch(() => ({}));
        console.error("Kullanıcı bilgileri güncelleme hatası:", errorData);
        throw new Error("Kullanıcı bilgileri güncellenirken bir hata oluştu");
      }
      
      // API'ye göre applicationId bekleniyor
      const applicationData: ApplicationData = {
        applicationId: selectedScholarship === "custom" ? undefined : selectedScholarship,
        notes: formData.additionalInfo,
      };
      
      // Eğer özel burs ise, customScholarship eklemeye çalışalım
      if (selectedScholarship === "custom" && scholarshipTitle) {
        applicationData.customScholarship = scholarshipTitle;
      }
      
      console.log("API'ye gönderilen veri:", applicationData);
      
      // Başvuruyu oluştur
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API hata detayı (ham):", errorText);
        try {
          const errorJson = JSON.parse(errorText);
          console.error("API hata detayı (JSON):", errorJson);
        } catch {
          // JSON'a çevrilemiyorsa raw text olarak bırak
        }
        throw new Error(`Başvuru oluşturulurken bir hata oluştu: ${response.status} ${response.statusText}`);
      }

      const data = await response.json()
      toast.success("Başvurunuz başarıyla oluşturuldu")
      router.push(`/applications/${data.id}`)
    } catch (error) {
      console.error("Başvuru oluşturma hatası:", error)
      toast.error("Başvurunuz oluşturulurken bir hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <h1 className="text-2xl font-bold">Burs Başvurusu Oluştur</h1>
          <p className="text-muted-foreground">
            Sistemde kayıtlı burs programı bulunamadı, ancak yine de başvuru oluşturabilirsiniz.
          </p>
        </div>
        
        <Separator />
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Burs Başvuru Formu</CardTitle>
              <CardDescription>
                Başvurunuzu oluşturmak için aşağıdaki formu doldurun.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Burs Bilgileri */}
              <div>
                <h3 className="text-lg font-medium mb-2">Burs Bilgileri</h3>
                <div className="space-y-2">
                  <Label htmlFor="scholarshipTitle">Burs Programı Adı</Label>
                  <Input
                    id="scholarshipTitle"
                    name="scholarshipTitle"
                    placeholder="Burs programının adını girin"
                    onChange={(e) => {
                      setScholarshipTitle(e.target.value)
                      setSelectedScholarship("custom")
                    }}
                    value={scholarshipTitle}
                    required
                  />
                </div>
              </div>

              <Separator />
              
              {/* Kişisel Bilgiler */}
              <div>
                <h3 className="text-lg font-medium mb-2">Kişisel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ad ve soyadınızı girin"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Doğum Tarihi</Label>
                    <Input
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      type="date"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Uyruk</Label>
                    <Input
                      id="nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      placeholder="Uyruğunuzu girin"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession">Meslek</Label>
                    <Input
                      id="profession"
                      name="profession"
                      value={formData.profession}
                      onChange={handleInputChange}
                      placeholder="Mesleğinizi girin"
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />
              
              {/* Belgeler Bilgilendirme */}
              <div>
                <h3 className="text-lg font-medium mb-2">Belgeler</h3>
                <div className="bg-blue-50 text-blue-700 p-4 rounded-md border border-blue-200">
                  <p className="text-sm">
                    Başvurunuz tamamlandıktan sonra gerekli belgeleri &ldquo;Evraklarım&rdquo; sayfasından yükleyebilirsiniz. 
                    Evrakların zamanında ve eksiksiz yüklenmesi başvurunuzun değerlendirilmesi için önemlidir.
                  </p>
                </div>
              </div>

              <Separator />
              
              {/* Eğitim Bilgileri */}
              <div>
                <h3 className="text-lg font-medium mb-2">Eğitim Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="university">Üniversite</Label>
                    <Input
                      id="university"
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      placeholder="Üniversite adını girin"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Bölüm</Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Bölüm adını girin"
                      required
                    />
                  </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="grade">Sınıf</Label>
                    <Select 
                      value={formData.grade} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sınıf seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1. Sınıf</SelectItem>
                        <SelectItem value="2">2. Sınıf</SelectItem>
                        <SelectItem value="3">3. Sınıf</SelectItem>
                        <SelectItem value="4">4. Sınıf</SelectItem>
                        <SelectItem value="5">5. Sınıf</SelectItem>
                        <SelectItem value="master">Yüksek Lisans</SelectItem>
                        <SelectItem value="phd">Doktora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gpa">Not Ortalaması</Label>
                    <Input
                      id="gpa"
                      name="gpa"
                      value={formData.gpa}
                      onChange={handleInputChange}
                      placeholder="Not ortalamanızı girin (ör: 3.50)"
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />
              
              {/* Diğer Burs Bilgileri */}
              <div>
                <h3 className="text-lg font-medium mb-2">Diğer Burs Bilgileri</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="otherScholarship" 
                      checked={formData.otherScholarship}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <Label htmlFor="otherScholarship">Halihazırda başka bir burs alıyorum</Label>
                  </div>
                  
                  {formData.otherScholarship && (
                    <div className="space-y-2">
                      <Label htmlFor="otherScholarshipDetails">Burs Detayları</Label>
                      <Textarea
                        id="otherScholarshipDetails"
                        name="otherScholarshipDetails"
                        value={formData.otherScholarshipDetails}
                        onChange={handleInputChange}
                        placeholder="Aldığınız bursun detaylarını girin (kurum, miktar, vb.)"
                        rows={3}
                        required={formData.otherScholarship}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator />
              
              {/* Ek Bilgiler */}
              <div>
                <h3 className="text-lg font-medium mb-2">Ek Bilgiler</h3>
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Ek Bilgiler (İsteğe Bağlı)</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Başvurunuzla ilgili eklemek istediğiniz bilgileri girin"
                    rows={4}
                  />
                </div>
              </div>

              <Separator />
              
              {/* Şartlar ve Koşullar */}
              <div className="pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Şartlar ve Koşullar
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Verdiğim bilgilerin doğruluğunu onaylıyorum ve burs programının şartlarını ve koşullarını
                      kabul ediyorum.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/applications">
                <Button variant="outline">İptal</Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isSubmitting || !termsAccepted}
              >
                {isSubmitting ? "Başvuru Yapılıyor..." : "Başvuruyu Tamamla"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Burs Başvurusu Oluştur</h1>
        <p className="text-muted-foreground">
          Burs başvurusu oluşturmak için aşağıdaki formu doldurun.
        </p>
      </div>
      
      <Separator />
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Burs Başvuru Formu</CardTitle>
            <CardDescription>
              Başvurunuzu oluşturmak için aşağıdaki formu doldurun.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Burs Programı Seçimi */}
            <div>
              <h3 className="text-lg font-medium mb-2">Burs Programı Seçimi</h3>
              <div className="space-y-2">
                <Label htmlFor="scholarship">Burs Programı</Label>
                <Select 
                  value={selectedScholarship} 
                  onValueChange={setSelectedScholarship}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Burs programı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {scholarships.map((scholarship) => (
                      <SelectItem key={scholarship.id} value={scholarship.id}>
                        {scholarship.title} (Son Başvuru: {format(new Date(scholarship.deadline), "d MMMM yyyy", { locale: tr })})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />
            
            {/* Kişisel Bilgiler */}
            <div>
              <h3 className="text-lg font-medium mb-2">Kişisel Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ad ve soyadınızı girin"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Doğum Tarihi</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    type="date"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Uyruk</Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    placeholder="Uyruğunuzu girin"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession">Meslek</Label>
                  <Input
                    id="profession"
                    name="profession"
                    value={formData.profession}
                    onChange={handleInputChange}
                    placeholder="Mesleğinizi girin"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />
            
            {/* Belgeler Bilgilendirme */}
            <div>
              <h3 className="text-lg font-medium mb-2">Belgeler</h3>
              <div className="bg-blue-50 text-blue-700 p-4 rounded-md border border-blue-200">
                <p className="text-sm">
                  Başvurunuz tamamlandıktan sonra gerekli belgeleri &ldquo;Evraklarım&rdquo; sayfasından yükleyebilirsiniz. 
                  Evrakların zamanında ve eksiksiz yüklenmesi başvurunuzun değerlendirilmesi için önemlidir.
                </p>
              </div>
            </div>

            <Separator />
            
            {/* Eğitim Bilgileri */}
            <div>
              <h3 className="text-lg font-medium mb-2">Eğitim Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="university">Üniversite</Label>
                  <Input
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    placeholder="Üniversite adını girin"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Bölüm</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Bölüm adını girin"
                    required
                  />
                </div>
              
                <div className="space-y-2">
                  <Label htmlFor="grade">Sınıf</Label>
                  <Select 
                    value={formData.grade} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sınıf seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1. Sınıf</SelectItem>
                      <SelectItem value="2">2. Sınıf</SelectItem>
                      <SelectItem value="3">3. Sınıf</SelectItem>
                      <SelectItem value="4">4. Sınıf</SelectItem>
                      <SelectItem value="5">5. Sınıf</SelectItem>
                      <SelectItem value="master">Yüksek Lisans</SelectItem>
                      <SelectItem value="phd">Doktora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gpa">Not Ortalaması</Label>
                  <Input
                    id="gpa"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleInputChange}
                    placeholder="Not ortalamanızı girin (ör: 3.50)"
                    type="number"
                    min="0"
                    max="4"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />
            
            {/* Diğer Burs Bilgileri */}
            <div>
              <h3 className="text-lg font-medium mb-2">Diğer Burs Bilgileri</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="otherScholarship" 
                    checked={formData.otherScholarship}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="otherScholarship">Halihazırda başka bir burs alıyorum</Label>
                </div>
                
                {formData.otherScholarship && (
                  <div className="space-y-2">
                    <Label htmlFor="otherScholarshipDetails">Burs Detayları</Label>
                    <Textarea
                      id="otherScholarshipDetails"
                      name="otherScholarshipDetails"
                      value={formData.otherScholarshipDetails}
                      onChange={handleInputChange}
                      placeholder="Aldığınız bursun detaylarını girin (kurum, miktar, vb.)"
                      rows={3}
                      required={formData.otherScholarship}
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />
            
            {/* Ek Bilgiler */}
            <div>
              <h3 className="text-lg font-medium mb-2">Ek Bilgiler</h3>
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Ek Bilgiler (İsteğe Bağlı)</Label>
                <Textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  placeholder="Başvurunuzla ilgili eklemek istediğiniz bilgileri girin"
                  rows={4}
                />
              </div>
            </div>

            <Separator />
            
            {/* Şartlar ve Koşullar */}
            <div className="pt-4">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Şartlar ve Koşullar
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Verdiğim bilgilerin doğruluğunu onaylıyorum ve burs programının şartlarını ve koşullarını
                    kabul ediyorum.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/applications">
              <Button variant="outline">İptal</Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting || !termsAccepted}
            >
              {isSubmitting ? "Başvuru Yapılıyor..." : "Başvuruyu Tamamla"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
} 