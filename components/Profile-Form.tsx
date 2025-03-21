"use client"

import type React from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Check, ChevronsUpDown, Upload, X, FileText } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useState } from "react"

import { cx } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { PhoneInput } from "@/components/phone-input"

const universities = [
  { label: "Boğaziçi Üniversitesi", value: "bogazici" },
  { label: "İstanbul Teknik Üniversitesi", value: "itu" },
  { label: "Orta Doğu Teknik Üniversitesi", value: "odtu" },
  { label: "Ankara Üniversitesi", value: "ankara" },
  { label: "Ege Üniversitesi", value: "ege" },
  { label: "Hacettepe Üniversitesi", value: "hacettepe" },
  { label: "Yıldız Teknik Üniversitesi", value: "ytu" },
  { label: "Marmara Üniversitesi", value: "marmara" },
  { label: "Diğer", value: "other" },
]

const departments = [
  { label: "Bilgisayar Mühendisliği", value: "computer-engineering" },
  { label: "Elektrik-Elektronik Mühendisliği", value: "electrical-engineering" },
  { label: "Makine Mühendisliği", value: "mechanical-engineering" },
  { label: "Endüstri Mühendisliği", value: "industrial-engineering" },
  { label: "İşletme", value: "business" },
  { label: "Ekonomi", value: "economics" },
  { label: "Tıp", value: "medicine" },
  { label: "Hukuk", value: "law" },
  { label: "Diğer", value: "other" },
]

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "İsim en az 2 karakter olmalıdır.",
  }),
  lastName: z.string().min(2, {
    message: "Soyisim en az 2 karakter olmalıdır.",
  }),
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz.",
  }),
  phone: z.string().min(10, {
    message: "Geçerli bir telefon numarası giriniz.",
  }),
  birthDate: z.date({
    required_error: "Doğum tarihi seçiniz.",
  }),
  university: z.string({
    required_error: "Lütfen üniversitenizi seçiniz.",
  }),
  department: z.string({
    required_error: "Lütfen bölümünüzü seçiniz.",
  }),
  grade: z.enum(["1", "2", "3", "4", "5+", "graduate"], {
    required_error: "Lütfen sınıfınızı seçiniz.",
  }),
  gpa: z.string().min(1, {
    message: "Lütfen not ortalamanızı giriniz.",
  }),
})

export function ProfileForm() {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
  }

  const removeFile = () => {
    setFile(null)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      university: "",
      department: "",
      gpa: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Başvurunuz alındı",
      description: "Başvurunuz başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.",
    })
    console.log({ ...values, file })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Burs Başvuru Formu</CardTitle>
        <CardDescription>Burs başvurunuzu tamamlamak için lütfen aşağıdaki bilgileri doldurunuz.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <div className="text-lg font-medium">Kişisel Bilgiler</div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İsim</FormLabel>
                      <FormControl>
                        <Input placeholder="İsminizi giriniz" {...field} />
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
                      <FormLabel>Soy Ad</FormLabel>
                      <FormControl>
                        <Input placeholder="Soyisminizi giriniz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <Input placeholder="ornek@mail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start">
                      <FormLabel>Telefon</FormLabel>
                      <FormControl className="w-full">
                      <PhoneInput
                    placeholder="Placeholder"
                    {...field}
                    defaultCountry="TR"
                  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Doğum Tarihi</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cx("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", { locale: tr }) : <span>Tarih seçiniz</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="text-lg font-medium">Eğitim Bilgileri</div>

              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Üniversite</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cx("w-full justify-between", !field.value && "text-muted-foreground")}
                          >
                            {field.value
                              ? universities.find((university) => university.value === field.value)?.label
                              : "Üniversite seçiniz"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Üniversite ara..." />
                          <CommandList>
                            <CommandEmpty>Üniversite bulunamadı.</CommandEmpty>
                            <CommandGroup>
                              {universities.map((university) => (
                                <CommandItem
                                  value={university.label}
                                  key={university.value}
                                  onSelect={() => {
                                    form.setValue("university", university.value)
                                  }}
                                >
                                  <Check
                                    className={cx(
                                      "mr-2 h-4 w-4",
                                      university.value === field.value ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {university.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Bölüm</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cx("w-full justify-between", !field.value && "text-muted-foreground")}
                          >
                            {field.value
                              ? departments.find((department) => department.value === field.value)?.label
                              : "Bölüm seçiniz"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Bölüm ara..." />
                          <CommandList>
                            <CommandEmpty>Bölüm bulunamadı.</CommandEmpty>
                            <CommandGroup>
                              {departments.map((department) => (
                                <CommandItem
                                  value={department.label}
                                  key={department.value}
                                  onSelect={() => {
                                    form.setValue("department", department.value)
                                  }}
                                >
                                  <Check
                                    className={cx(
                                      "mr-2 h-4 w-4",
                                      department.value === field.value ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {department.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Sınıf</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-wrap gap-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="1" />
                          </FormControl>
                          <FormLabel className="font-normal">1. Sınıf</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="2" />
                          </FormControl>
                          <FormLabel className="font-normal">2. Sınıf</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="3" />
                          </FormControl>
                          <FormLabel className="font-normal">3. Sınıf</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="4" />
                          </FormControl>
                          <FormLabel className="font-normal">4. Sınıf</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="5+" />
                          </FormControl>
                          <FormLabel className="font-normal">5+ Sınıf</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="graduate" />
                          </FormControl>
                          <FormLabel className="font-normal">Lisansüstü</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Not Ortalaması (GPA)</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: 3.50" {...field} />
                    </FormControl>
                    <FormDescription>4.00 üzerinden not ortalamanızı giriniz.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="text-lg font-medium">Belge Yükleme</div>

              <div className="mt-4 flex text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground sm:mx-0 sm:h-6 sm:w-6" aria-hidden={true} />
                  <div className="mt-4 flex text-sm leading-6 text-muted-foreground sm:mt-0">
                    <p>Sürükle bırak veya</p>
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md pl-1 font-medium text-blue-600 hover:underline hover:underline-offset-4"
                    >
                      <span>dosya seç</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">yüklemek için</p>
                  </div>
                </div>
              </div>
              <p className="mt-2 flex items-center justify-between text-xs leading-5 text-muted-foreground">
                Önerilen maksimum boyut: 10 MB, Kabul edilen dosya türleri: PDF, JPG, PNG.
              </p>

              {file && (
                <div className="relative mt-4 rounded-lg bg-muted p-4">
                  <div className="absolute right-1 top-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Kaldır"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" aria-hidden={true} />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background shadow-sm ring-1 ring-inset ring-border">
                      <FileText className="h-5 w-5 text-foreground" aria-hidden={true} />
                    </span>
                    <div className="w-full">
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="mt-0.5 flex justify-between text-xs text-muted-foreground">
                        <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>Yüklendi</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
              Başvuruyu Gönder
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t px-6 py-4 text-sm text-muted-foreground">
        <p>Başvurunuz gönderildikten sonra, değerlendirme sürecimiz başlayacaktır.</p>
        <p>Sonuçlar e-posta adresinize bildirilecektir.</p>
      </CardFooter>
    </Card>
  )
}

