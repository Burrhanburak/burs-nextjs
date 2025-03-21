"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  documentType: string;
  scholarshipApplicationId: string;
}

export default function FileUploader({
  onUploadComplete,
  documentType,
  scholarshipApplicationId,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { startUpload } = useUploadThing("documentUploader");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if file is PDF
    if (selectedFile.type !== "application/pdf") {
      toast.error("Lütfen sadece PDF dosyası yükleyin");
      return;
    }

    // Check if file size is under 4MB
    if (selectedFile.size > 4 * 1024 * 1024) {
      toast.error("Dosya boyutu 4MB'dan küçük olmalıdır");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Lütfen bir dosya seçin");
      return;
    }

    try {
      setUploading(true);
      
      // Upload the file
      const uploadResponse = await startUpload([file]);
      
      if (!uploadResponse || !uploadResponse[0]?.url) {
        throw new Error("Dosya yükleme başarısız");
      }
      
      const fileUrl = uploadResponse[0].url;
      
      // Save to database
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: fileUrl,
          type: documentType,
          scholarshipApplicationId,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Veritabanına kayıt sırasında hata oluştu");
      }
      
      toast.success("Dosya başarıyla yüklendi");
      onUploadComplete(fileUrl);
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Dosya yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border border-dashed rounded-lg border-gray-300">
      <label 
        htmlFor="file-upload" 
        className="flex flex-col items-center justify-center w-full gap-2 p-6 cursor-pointer"
      >
        <UploadCloud className="w-12 h-12 text-gray-400" />
        <p className="text-sm text-gray-600">
          {file ? file.name : "PDF dosyası seçmek için tıklayın (maks. 4MB)"}
        </p>
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      
      {file && (
        <Button 
          onClick={handleUpload} 
          disabled={uploading}
          className="w-full"
        >
          {uploading ? "Yükleniyor..." : "Dosyayı Yükle"}
        </Button>
      )}
    </div>
  );
} 