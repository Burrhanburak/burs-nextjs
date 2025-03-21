"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { toast } from "sonner"
import { 
  RiUploadCloudLine, 
  RiFileTextLine, 
  RiImageLine, 
  RiFileDownloadLine, 
  RiCloseCircleLine
} from "@remixicon/react"
import { useUploadThing } from "@/lib/uploadthing"
import { Progress } from "@/components/ui/progress"

interface StudentCertificateUploadProps {
  onUploadComplete: (file: File, url: string) => void
  scholarshipApplicationId?: string
}

export default function StudentCertificateUpload({ onUploadComplete, scholarshipApplicationId }: StudentCertificateUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isPending, setIsPending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Use UploadThing with documentUploader endpoint
  const { startUpload } = useUploadThing("documentUploader", {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      
      if (res && res.length > 0 && selectedFile) {
        const fileUrl = res[0].url;
        console.log("Upload complete:", fileUrl);
        
        // Now manually save document to database
        saveDocument(selectedFile, fileUrl);
      }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file: File) => {
    // Check file type
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png']
    const fileType = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    
    if (!allowedTypes.includes(fileType)) {
      toast.error("Sadece PDF, JPG ve PNG dosyaları kabul edilmektedir.")
      return false
    }
    
    // Check file size (4MB = 4 * 1024 * 1024 bytes)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Dosya boyutu 4MB'dan küçük olmalıdır.")
      return false
    }
    
    // Rename file to include "student_certificate" so the server can identify it
    const newFile = new File(
      [file], 
      `student_certificate_${Date.now()}${fileType}`, 
      { type: file.type }
    )
    
    setSelectedFile(newFile)
    return true
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      validateAndSetFile(file)
    }
  }

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Added back the saveDocument function
  const saveDocument = async (file: File, fileUrl: string) => {
    try {
      setIsPending(true)
      // Complete the progress bar
      setUploadProgress(100)
      
      // Save document to database with scholarshipApplicationId if it exists
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: fileUrl,
          type: 'student_certificate',
          name: 'Öğrenci Belgesi',
          scholarshipApplicationId: scholarshipApplicationId
        }),
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Belge kaydı başarısız' }))
        throw new Error(error.message || 'Belge kaydı başarısız')
      }
      
      // Document successfully saved
      toast.success("Öğrenci belgeniz başarıyla yüklendi")
      onUploadComplete(file, fileUrl)
      setSelectedFile(null)
    } catch (error: unknown) {
      console.error("Belge kaydetme hatası:", error)
      const errorMessage = error instanceof Error ? error.message : 'Lütfen tekrar deneyin.'
      toast.error(`Belge kaydedilirken bir hata oluştu: ${errorMessage}`)
    } finally {
      setIsUploading(false)
      setIsPending(false)
      setUploadProgress(0)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Lütfen bir dosya seçin")
      return
    }

    setIsUploading(true)

    try {
      // Pass scholarshipApplicationId to UploadThing if it exists
      const uploadResult = await startUpload([selectedFile], {
        scholarshipApplicationId: scholarshipApplicationId
      })
      console.log("Upload result:", uploadResult)
      
      // If we get here without an error, but no result, something went wrong
      if (!uploadResult || uploadResult.length === 0) {
        throw new Error("Yükleme başarısız oldu")
      }
    } catch (error: unknown) {
      console.error("Belge yükleme hatası:", error)
      const errorMessage = error instanceof Error ? error.message : 'Lütfen tekrar deneyin.'
      toast.error(`Belge yüklenirken bir hata oluştu: ${errorMessage}`)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const getFileIcon = () => {
    if (!selectedFile) return <RiUploadCloudLine className="h-6 w-6 text-zinc-500 mb-2" />
    
    const fileType = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase()
    
    if (['.jpg', '.jpeg', '.png'].includes(fileType)) {
      return <RiImageLine className="h-6 w-6 text-zinc-500 mb-2" />
    } else if (fileType === '.pdf') {
      return <RiFileDownloadLine className="h-6 w-6 text-zinc-500 mb-2" />
    }
    
    return <RiFileTextLine className="h-6 w-6 text-zinc-500 mb-2" />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Öğrenci Belgesi Yükleme</CardTitle>
        <CardDescription>
          E-Devlet&apos;ten veya üniversitenizden alacağınız öğrenci belgesini yükleyin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Dropzone Area */}
        <div 
          className={`
            border-2 border-dashed rounded-lg p-12 transition-colors
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
              : 'border-gray-300 dark:border-gray-700'
            }
            ${selectedFile ? 'bg-green-50 dark:bg-green-950/20 border-green-300' : ''}
            hover:border-gray-400 dark:hover:border-gray-600
            ${!isUploading && !isPending ? 'cursor-pointer' : ''}
          `}
          onDragOver={!isUploading && !isPending ? handleDragOver : undefined}
          onDragLeave={!isUploading && !isPending ? handleDragLeave : undefined}
          onDrop={!isUploading && !isPending ? handleDrop : undefined}
          onClick={!isUploading && !isPending ? openFileSelector : undefined}
        >
          <div className="h-full w-full flex-1 flex flex-col items-center justify-center">
            <input 
              {...{
                type: 'file',
                ref: fileInputRef,
                className: 'hidden',
                accept: '.pdf,.jpg,.jpeg,.png',
                onChange: handleFileChange,
                disabled: isUploading || isPending
              }}
            />
            
            {isDragging ? (
              <RiUploadCloudLine className="h-6 w-6 text-blue-500 mb-2" />
            ) : isUploading || isPending ? (
              <div className="animate-spin h-6 w-6 text-zinc-500 mb-2 border-2 border-t-transparent border-zinc-500 rounded-full" />
            ) : (
              getFileIcon()
            )}
            
            <div className="flex flex-col justify-center mb-2 text-sm text-zinc-700">
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <p>Yükleniyor...</p>
                  <Progress
                    value={uploadProgress}
                    className="mt-2 w-40 h-2 bg-gray-300"
                  />
                </div>
              ) : isPending ? (
                <div className="flex flex-col items-center">
                  <p>İşlem tamamlanıyor, lütfen bekleyin...</p>
                </div>
              ) : isDragging ? (
                <p>
                  <span className="font-semibold">Dosyayı bırakın</span> ve yükleyin
                </p>
              ) : selectedFile ? (
                <div className="flex flex-col items-center">
                  <p className="font-semibold">{selectedFile.name.replace(/^student_certificate_\d+/, 'Öğrenci Belgesi')}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <p>
                  <span className="font-semibold">Tıklayarak yükleyin</span> veya dosyayı sürükleyip bırakın
                </p>
              )}
            </div>
            
            {!isUploading && !isPending && !selectedFile && (
              <p className="text-xs text-zinc-500">PDF, JPG, JPEG, PNG (Maks. 4MB)</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-end space-x-2">
          {selectedFile && !isUploading && !isPending && (
            <>
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFile(null)
                }}
                disabled={isUploading || isPending}
              >
                <RiCloseCircleLine className="mr-1 h-4 w-4" />
                İptal
              </Button>
              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleUpload()
                }}
                disabled={isUploading || isPending}
              >
                <RiUploadCloudLine className="mr-1 h-4 w-4" />
                Belgeyi Yükle
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 