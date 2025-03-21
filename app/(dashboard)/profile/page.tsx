"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "İsim en az 2 karakter olmalıdır",
  }),
  lastName: z.string().min(2, {
    message: "Soyisim en az 2 karakter olmalıdır",
  }),
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz",
  }),
  mobilePhone: z.string().min(10, {
    message: "Geçerli bir telefon numarası giriniz",
  }),
  university: z.string().optional(),
  grade: z.string().optional(),
  otherScholarship: z.boolean().default(false),
  otherScholarshipDetails: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  
  // Empty default values to start with
  const defaultValues: Partial<ProfileFormValues> = {
    firstName: "",
    lastName: "",
    email: "",
    mobilePhone: "",
    university: "",
    grade: "",
    otherScholarship: false,
    otherScholarshipDetails: "",
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  // Fetch user data when component mounts
  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/users/me', { 
      signal: controller.signal,
      cache: 'no-store',
      next: { revalidate: 0 } // Next.js 15 approach
    })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data) {
          // Map API data to form values
          const profileData: Partial<ProfileFormValues> = {
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            mobilePhone: data.mobilePhone || "",
            university: data.university || "",
            grade: data.grade || "",
            otherScholarship: data.otherScholarship || false,
            otherScholarshipDetails: data.otherScholarshipDetails || "",
          };
          
          // Reset form with the fetched data
          Object.keys(profileData).forEach(key => {
            const fieldKey = key as keyof ProfileFormValues;
            const fieldValue = profileData[fieldKey];
            form.setValue(fieldKey, fieldValue as never);
          });
        }
        setIsLoading(false);
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Error fetching user data:', error);
          toast.error("Profil bilgileriniz yüklenirken bir hata oluştu");
        }
        setIsLoading(false);
      });
    
    return () => controller.abort();
  }, [form]);

  function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    
    // Call the API to update profile
    fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Profile update failed');
        }
        return response.json();
      })
      .then(() => {
        toast.success("Profil bilgileriniz güncellendi");
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        toast.error("Profil bilgileriniz güncellenirken bir hata oluştu");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profil</h3>
        <p className="text-sm text-muted-foreground">
          Profil bilgilerinizi buradan güncelleyebilirsiniz.
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Profil Bilgileri</TabsTrigger>
          <TabsTrigger value="preferences">Tercihler</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>
                Kişisel bilgilerinizi buradan güncelleyebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>İsim</FormLabel>
                          <FormControl>
                            <Input placeholder="İsim" {...field} />
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
                          <FormLabel>Soyisim</FormLabel>
                          <FormControl>
                            <Input placeholder="Soyisim" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta</FormLabel>
                          <FormControl>
                            <Input placeholder="E-posta" {...field} disabled />
                          </FormControl>
                          <FormDescription>
                            E-posta adresiniz sistemde kimliğiniz olarak kullanılır ve değiştirilemez.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobilePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon Numarası</FormLabel>
                          <FormControl>
                            <Input placeholder="5XX XXX XX XX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="university"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Üniversite</FormLabel>
                          <FormControl>
                            <Input placeholder="Üniversite adı" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sınıf</FormLabel>
                          <FormControl>
                            <Input placeholder="Örn: 3" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="otherScholarship"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Başka Bursum Var</FormLabel>
                            <FormDescription>
                              Başka bir kurumdan burs alıyorsanız işaretleyin
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {form.watch("otherScholarship") && (
                      <FormField
                        control={form.control}
                        name="otherScholarshipDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Burs Detayları</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Aldığınız diğer burslar hakkında bilgi verin"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Tercihleri</CardTitle>
              <CardDescription>
                Hangi konularda bildirim almak istediğinizi seçin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notifications-application" className="flex flex-col space-y-1">
                  <span>Başvuru Bildirimleri</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Başvuru durumlarınızdaki değişiklikler hakkında bildirim alın.
                  </span>
                </Label>
                <Switch id="notifications-application" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notifications-document" className="flex flex-col space-y-1">
                  <span>Belge Bildirimleri</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Belgelerinizin onay durumları hakkında bildirim alın.
                  </span>
                </Label>
                <Switch id="notifications-document" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notifications-interview" className="flex flex-col space-y-1">
                  <span>Mülakat Bildirimleri</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Mülakat tarihleri ve sonuçları hakkında bildirim alın.
                  </span>
                </Label>
                <Switch id="notifications-interview" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Tercihleri Kaydet</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 