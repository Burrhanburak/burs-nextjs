"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CircleCheck, Save, Loader2, Search, FileText, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { getBursiyerler } from "@/lib/server-actions"

// Türkiye illeri
const iller = [
  { value: "istanbul", label: "İstanbul" },
  { value: "ankara", label: "Ankara" },
  { value: "izmir", label: "İzmir" },
  { value: "bursa", label: "Bursa" },
  { value: "antalya", label: "Antalya" },
  // Diğer iller eklenebilir
]

// Bursiyer adresi tipi
interface BursiyerAdresi {
  adSoyad: string
  tcKimlikNo: string
  adresSatiri1: string
  adresSatiri2: string
  sehir: string
  ilce: string
  il: string
  postaKodu: string
  telefon: string
  email: string
}

// Bursiyer tipi
interface Bursiyer {
  id: string
  adSoyad: string
  tcKimlikNo: string
  universiteKurumu: string
  bolum: string
  sinif: string
  durum: string
  baslangicTarihi: string
  bitisTarihi: string
  adresBilgileri: BursiyerAdresi
  odemeBilgileri: {
    sonOdeme?: string
    toplamOdenen: number
  }
}

// Bursiyer durumu badge bileşeni
function BursiyerDurumBadge() {
  return <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>
}

export default function BursiyerBilgileriSayfasi() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [bursiyerler, setBursiyerler] = useState<Bursiyer[]>([])
  const [seciliBursiyer, setSeciliBursiyer] = useState<BursiyerAdresi | null>(null)
  
  // Bursiyerleri yükle
  useEffect(() => {
    async function fetchBursiyerler() {
      setLoading(true)
      try {
        const data = await getBursiyerler()
        console.log("Yüklenen bursiyerler:", data.length)
        setBursiyerler(data)
      } catch (error) {
        console.error("Bursiyerler yüklenirken hata:", error)
        toast.error("Bursiyerler yüklenirken bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }
    
    fetchBursiyerler()
  }, [])
  
  // Bursiyer bilgilerini yükle
  const loadBursiyerDetaylari = (id: string) => {
    setLoading(true)
    
    // ID'ye göre bursiyeri bul
    const selectedBursiyer = bursiyerler.find(b => b.id === id)
    
    if (selectedBursiyer) {
      setSeciliBursiyer(selectedBursiyer.adresBilgileri)
    } else {
      toast.error("Bursiyer bulunamadı")
    }
    
    setLoading(false)
  }
  
  // Form güncellemelerini işle
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!seciliBursiyer) return
    
    const { id, value } = e.target
    setSeciliBursiyer(prev => ({
      ...prev!,
      [id]: value
    }))
  }
  
  // İl değişimini işle
  const handleIlChange = (value: string) => {
    if (!seciliBursiyer) return
    
    setSeciliBursiyer(prev => ({
      ...prev!,
      il: value
    }))
  }
  
  // Bursiyer bilgilerini kaydet
  const saveBursiyerBilgileri = async () => {
    if (!seciliBursiyer) return
    
    setSaving(true)
    try {
      // Gerçek bir API çağrısı eklenecek
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast.success("Bursiyer bilgileri başarıyla güncellendi")
    } catch (error) {
      console.error("Bursiyer bilgileri kaydedilirken hata oluştu:", error)
      toast.error("Bursiyer bilgileri kaydedilirken bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }
  
  // Bursiyerleri filtrele
  const filteredBursiyerler = searchTerm 
    ? bursiyerler.filter(b => 
        b.adSoyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.tcKimlikNo.includes(searchTerm)
      )
    : bursiyerler

  return (
    <div className="space-y-8">
      <section>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-50">
              Bursiyer Bilgileri
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Bursiyerlerin bilgilerini görüntüleyebilir ve düzenleyebilirsiniz.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Toplam Bursiyer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bursiyerler.length}</div>
                  <p className="text-xs text-muted-foreground">Kayıtlı bursiyerler</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Aktif Bursiyerler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-medium">
                      {bursiyerler.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Burs almaya devam edenler</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Program Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    2024-2025
                  </div>
                  <p className="text-xs text-muted-foreground">Eğitim-öğretim yılı</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center space-x-2 mt-8">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="İsim, ID veya TC Kimlik No ile ara..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-50">
              Bursiyerler
            </h3>
            
            {loading && !seciliBursiyer ? (
              <div className="flex justify-center items-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                  <p className="text-sm text-muted-foreground">Bursiyerler yükleniyor...</p>
                </div>
              </div>
            ) : filteredBursiyerler.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-muted p-3">
                  <UserCheck className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">Bursiyer Bulunamadı</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  Arama kriterlerine uygun bursiyer bulunmamaktadır.
                </p>
              </div>
            ) : (
              <div className="mt-4 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>Üniversite/Kurum</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBursiyerler.map((bursiyer) => (
                      <TableRow key={bursiyer.id}>
                        <TableCell className="font-medium">{bursiyer.id}</TableCell>
                        <TableCell>{bursiyer.adSoyad}</TableCell>
                        <TableCell>
                          <div>{bursiyer.universiteKurumu}</div>
                          <div className="text-xs text-muted-foreground">{bursiyer.bolum}</div>
                        </TableCell>
                        <TableCell>
                          <BursiyerDurumBadge />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => loadBursiyerDetaylari(bursiyer.id)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Detaylar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {seciliBursiyer && (
        <>
          <Separator />
          
          <section>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-50">
                  Bursiyer İletişim Bilgileri
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Seçili bursiyerin iletişim ve adres bilgilerini düzenleyin.
                </p>
              </div>
              <div className="md:col-span-2">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                      <p className="text-sm text-muted-foreground">Bilgiler yükleniyor...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="adSoyad" className="font-medium">
                          Ad Soyad
                        </Label>
                        <Input
                          id="adSoyad"
                          placeholder="Ad Soyad"
                          value={seciliBursiyer.adSoyad}
                          onChange={handleInputChange}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tcKimlikNo" className="font-medium">
                          TC Kimlik No
                        </Label>
                        <Input
                          id="tcKimlikNo"
                          placeholder="TC Kimlik No"
                          value={seciliBursiyer.tcKimlikNo}
                          onChange={handleInputChange}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="font-medium">
                          E-posta
                        </Label>
                        <Input
                          id="email"
                          type="email" 
                          placeholder="E-posta"
                          value={seciliBursiyer.email}
                          onChange={handleInputChange}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefon" className="font-medium">
                          Telefon
                        </Label>
                        <Input
                          id="telefon"
                          placeholder="Telefon"
                          value={seciliBursiyer.telefon}
                          onChange={handleInputChange}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="adresSatiri1" className="font-medium">
                        Adres Satırı 1
                      </Label>
                      <Input
                        id="adresSatiri1"
                        placeholder="Adres satırı 1"
                        value={seciliBursiyer.adresSatiri1}
                        onChange={handleInputChange}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="adresSatiri2" className="font-medium">
                        Adres Satırı 2 (İsteğe Bağlı)
                      </Label>
                      <Input
                        id="adresSatiri2"
                        placeholder="Adres satırı 2"
                        value={seciliBursiyer.adresSatiri2}
                        onChange={handleInputChange}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sehir" className="font-medium">
                          Şehir
                        </Label>
                        <Input
                          id="sehir"
                          placeholder="Şehir"
                          value={seciliBursiyer.sehir}
                          onChange={handleInputChange}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="ilce" className="font-medium">
                          İlçe
                        </Label>
                        <Input
                          id="ilce"
                          placeholder="İlçe"
                          value={seciliBursiyer.ilce}
                          onChange={handleInputChange}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="il" className="font-medium">
                          İl
                        </Label>
                        <Select value={seciliBursiyer.il} onValueChange={handleIlChange}>
                          <SelectTrigger id="il" name="il" className="mt-2">
                            <SelectValue placeholder="İl seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {iller.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="postaKodu" className="font-medium">
                          Posta Kodu
                        </Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          id="postaKodu"
                          placeholder="Posta kodu"
                          value={seciliBursiyer.postaKodu}
                          onChange={handleInputChange}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setSeciliBursiyer(null)}
                      >
                        Listeye Dön
                      </Button>
                      
                      <Button 
                        type="button"
                        onClick={saveBursiyerBilgileri}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Bilgileri Güncelle
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
