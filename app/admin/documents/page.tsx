"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Document {
  id: string;
  url: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  scholarshipApplication: {
    id: string;
    status: string;
    application: {
      title: string;
    };
  } | null;
}

export default function DocumentsReviewPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<Document[]>([]);
  const [approvedDocuments, setApprovedDocuments] = useState<Document[]>([]);
  const [rejectedDocuments, setRejectedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (documents.length > 0) {
      setPendingDocuments(documents.filter(doc => doc.status === "PENDING"));
      setApprovedDocuments(documents.filter(doc => doc.status === "APPROVED"));
      setRejectedDocuments(documents.filter(doc => doc.status === "REJECTED"));
    }
  }, [documents]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/documents");
      if (!response.ok) {
        throw new Error("Evraklar alınırken bir hata oluştu");
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      toast.error("Evraklar alınırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      
      if (!response.ok) {
        throw new Error("Evrak onaylanırken bir hata oluştu");
      }
      
      toast.success("Evrak başarıyla onaylandı");
      fetchDocuments();
    } catch (error) {
      console.error(error);
      toast.error("Evrak onaylanırken bir hata oluştu");
    }
  };

  const handleReject = async () => {
    if (!selectedDocument) return;
    
    try {
      const response = await fetch(`/api/admin/documents/${selectedDocument.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "REJECTED", rejectionReason }),
      });
      
      if (!response.ok) {
        throw new Error("Evrak reddedilirken bir hata oluştu");
      }
      
      toast.success("Evrak reddedildi");
      setDialogOpen(false);
      setRejectionReason("");
      fetchDocuments();
    } catch (error) {
      console.error(error);
      toast.error("Evrak reddedilirken bir hata oluştu");
    }
  };

  const openRejectDialog = (document: Document) => {
    setSelectedDocument(document);
    setDialogOpen(true);
  };

  const openPreviewDialog = (url: string) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case "transcript":
        return "Transkript";
      case "id_card":
        return "Kimlik";
      case "student_certificate":
        return "Öğrenci Belgesi";
      case "income_statement":
        return "Gelir Belgesi";
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Evrak İncelemeleri</h1>
        <p className="text-muted-foreground mt-2">
          Yüklenen evrakları onaylamak veya reddetmek için inceleyin
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Bekleyenler ({pendingDocuments.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Onaylananlar ({approvedDocuments.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Reddedilenler ({rejectedDocuments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {loading ? (
            <div className="text-center py-12">Yükleniyor...</div>
          ) : pendingDocuments.length === 0 ? (
            <div className="text-center py-12">Bekleyen evrak bulunmamaktadır</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingDocuments.map((document) => (
                <Card key={document.id}>
                  <CardHeader>
                    <CardTitle>{document.user.firstName} {document.user.lastName}</CardTitle>
                    <CardDescription>{document.scholarshipApplication?.application.title || "Başvuru Bulunamadı"}</CardDescription>
                    <Badge className="bg-yellow-400 text-yellow-900 mt-2 w-fit">Bekliyor</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Evrak Türü:</span>
                        <span className="font-medium">{getDocumentTypeName(document.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yükleme Tarihi:</span>
                        <span className="font-medium">
                          {format(new Date(document.createdAt), "dd.MM.yyyy")}
                        </span>
                      </div>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => openPreviewDialog(document.url)}
                        >
                          Evrakı Görüntüle
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button 
                      variant="destructive"
                      onClick={() => openRejectDialog(document)}
                      className="w-1/2"
                    >
                      Reddet
                    </Button>
                    <Button 
                      onClick={() => handleApprove(document.id)}
                      className="w-1/2"
                    >
                      Onayla
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {loading ? (
            <div className="text-center py-12">Yükleniyor...</div>
          ) : approvedDocuments.length === 0 ? (
            <div className="text-center py-12">Onaylanan evrak bulunmamaktadır</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {approvedDocuments.map((document) => (
                <Card key={document.id}>
                  <CardHeader>
                    <CardTitle>{document.user.firstName} {document.user.lastName}</CardTitle>
                    <CardDescription>{document.scholarshipApplication?.application.title || "Başvuru Bulunamadı"}</CardDescription>
                    <Badge className="bg-green-100 text-green-800 mt-2 w-fit">Onaylandı</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Evrak Türü:</span>
                        <span className="font-medium">{getDocumentTypeName(document.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yükleme Tarihi:</span>
                        <span className="font-medium">
                          {format(new Date(document.createdAt), "dd.MM.yyyy")}
                        </span>
                      </div>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => openPreviewDialog(document.url)}
                        >
                          Evrakı Görüntüle
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {loading ? (
            <div className="text-center py-12">Yükleniyor...</div>
          ) : rejectedDocuments.length === 0 ? (
            <div className="text-center py-12">Reddedilen evrak bulunmamaktadır</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rejectedDocuments.map((document) => (
                <Card key={document.id}>
                  <CardHeader>
                    <CardTitle>{document.user.firstName} {document.user.lastName}</CardTitle>
                    <CardDescription>{document.scholarshipApplication?.application.title || "Başvuru Bulunamadı"}</CardDescription>
                    <Badge className="bg-red-100 text-red-800 mt-2 w-fit">Reddedildi</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Evrak Türü:</span>
                        <span className="font-medium">{getDocumentTypeName(document.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yükleme Tarihi:</span>
                        <span className="font-medium">
                          {format(new Date(document.createdAt), "dd.MM.yyyy")}
                        </span>
                      </div>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => openPreviewDialog(document.url)}
                        >
                          Evrakı Görüntüle
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evrakı Reddet</DialogTitle>
            <DialogDescription>
              Evrakı reddetme nedeninizi belirtin. Bu bilgi başvuru sahibine iletilecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reddetme nedeni"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Evrak Önizleme</DialogTitle>
          </DialogHeader>
          <div className="py-4 w-full h-[60vh] flex items-center justify-center">
            {previewUrl && (
              <iframe 
                src={previewUrl} 
                className="w-full h-full border-0" 
                title="Document Preview"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Kapat
            </Button>
            {previewUrl && (
              <Button asChild>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                  Yeni Pencerede Aç
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}