"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { RiArrowLeftLine, RiUploadCloudLine } from "@remixicon/react"
import { useUploadThing } from "@/lib/uploadthing"
import { toast } from "sonner"

export default function IncomeStatementPage() {
  const [isUploaded, setIsUploaded] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()
  
  // Use UploadThing with documentUploader endpoint
  const { startUpload } = useUploadThing("documentUploader", {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0 && selectedFile) {
        const fileUrl = res[0].url;
        console.log("Upload complete:", fileUrl);
        
        // Now manually save document to database
        saveDocument(selectedFile, fileUrl);
      }
      setIsUploading(false);
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      toast.error(`Belge yüklenirken bir hata oluştu: ${error.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadBegin: () => {
      toast.info("Belge yükleniyor, lütfen bekleyin...");
      // Start progress animation
      setUploadProgress(10);
      const timer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(timer);
            return 95;
          }
          return prev + 5;
        });
      }, 500);
    }
  });
  
  // Save document to database
  const saveDocument = async (file: File, fileUrl: string) => {
    try {
      // Complete the progress bar
      setUploadProgress(100);
      
      // Save document to database
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: fileUrl,
          type: 'income_statement' // Belge türünü income_statement olarak belirle
        }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Belge kaydı başarısız' }));
        throw new Error(error.message || 'Belge kaydı başarısız');
      }
      
      // Document successfully saved
      toast.success("Gelir belgesi başarıyla yüklendi");
      setUploadedUrl(fileUrl);
      setIsUploaded(true);
      
      // Redirect back to documents page after a brief delay
      setTimeout(() => {
        router.push("/documents");
        // Force a reload of the page to refresh the document list
        router.refresh();
      }, 2000);
    } catch (error: any) {
      console.error("Belge kaydetme hatası:", error);
      toast.error(`Belge kaydedilirken bir hata oluştu: ${error.message || 'Lütfen tekrar deneyin'}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Handle upload button click
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Lütfen bir dosya seçin");
      return;
    }
    
    setIsUploading(true);
    
    try {
      await startUpload([selectedFile]);
    } catch (error: any) {
      console.error("Yükleme hatası:", error);
      toast.error(`Yükleme sırasında bir hata oluştu: ${error.message || 'Lütfen tekrar deneyin'}`);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.back()}
        >
          <RiArrowLeftLine className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Gelir Belgesi Yükleme</h1>
      </div>
      
      <Separator />
      
      {isUploaded ? (
        <Card>
          <CardHeader>
            <CardTitle>Yükleme Başarılı</CardTitle>
            <CardDescription>
              Gelir belgesi başarıyla yüklendi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Gelir belgeniz başarıyla yüklendi. Belge incelendikten sonra size bildirim gönderilecektir.
            </p>
            {uploadedUrl && (
              <Button 
                variant="outline" 
                asChild
                className="mt-2"
              >
                <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
                  Belgeyi Görüntüle
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Gelir Belgesi Yükleme</CardTitle>
            <CardDescription>
              Ailenizin veya sizin gelir durumunuzu gösterir belgeyi yükleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <RiUploadCloudLine className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">Dosyayı seçin veya buraya sürükleyin</p>
                  <p className="text-sm text-muted-foreground">PDF, JPG, PNG (max: 4MB)</p>
                </label>
                
                {selectedFile && (
                  <div className="mt-4 text-center">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
                
                {isUploading && (
                  <div className="w-full mt-4">
                    <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300 ease-in-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm mt-2">Yükleniyor... {uploadProgress}%</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isUploading}
                >
                  İptal
                </Button>
                <Button
                  type="button"
                  disabled={!selectedFile || isUploading}
                  onClick={handleUpload}
                >
                  Yükle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="bg-blue-50 dark:bg-blue-950/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Bilgilendirme</h3>
        <ul className="mt-2 text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc pl-5">
          <li>Ailenizin gelir durumunu gösteren resmi belgeleri yükleyiniz.</li>
          <li>Belgeler son 3 ay içinde alınmış olmalıdır.</li>
          <li>Maaş bordrosu, emekli maaşı, kira geliri gibi tüm gelir kaynaklarını içermelidir.</li>
          <li>Belge üzerindeki tüm bilgiler net ve okunaklı olmalıdır.</li>
        </ul>
      </div>
    </div>
  )
} 