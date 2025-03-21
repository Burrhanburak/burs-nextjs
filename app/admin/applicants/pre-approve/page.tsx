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

interface ScholarshipApplication {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    tcKimlikNo: string;
    university: string | null;
    grade: string | null;
  };
  application: {
    id: string;
    title: string;
    description: string;
  };
  status: string;
  applicationDate: string;
  createdAt: string;
}

export default function PreApprovalPage() {
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [pendingApplications, setPendingApplications] = useState<ScholarshipApplication[]>([]);
  const [approvedApplications, setApprovedApplications] = useState<ScholarshipApplication[]>([]);
  const [rejectedApplications, setRejectedApplications] = useState<ScholarshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<ScholarshipApplication | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (applications.length > 0) {
      setPendingApplications(applications.filter(app => app.status === "PENDING"));
      setApprovedApplications(applications.filter(app => app.status === "PRE_APPROVED"));
      setRejectedApplications(applications.filter(app => app.status === "PRE_REJECTED"));
    }
  }, [applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/applications");
      if (!response.ok) {
        throw new Error("Başvurular alınırken bir hata oluştu");
      }
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error(error);
      toast.error("Başvurular alınırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${id}/pre-approve`, {
        method: "PATCH",
      });
      
      if (!response.ok) {
        throw new Error("Başvuru onaylanırken bir hata oluştu");
      }
      
      toast.success("Başvuru başarıyla ön onaylandı");
      fetchApplications();
    } catch (error) {
      console.error(error);
      toast.error("Başvuru onaylanırken bir hata oluştu");
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;
    
    try {
      const response = await fetch(`/api/admin/applications/${selectedApplication.id}/pre-reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rejectionReason }),
      });
      
      if (!response.ok) {
        throw new Error("Başvuru reddedilirken bir hata oluştu");
      }
      
      toast.success("Başvuru reddedildi");
      setDialogOpen(false);
      setRejectionReason("");
      fetchApplications();
    } catch (error) {
      console.error(error);
      toast.error("Başvuru reddedilirken bir hata oluştu");
    }
  };

  const openRejectDialog = (application: ScholarshipApplication) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Burs Başvuruları</h1>
        <p className="text-muted-foreground mt-2">
          Ön onay/ret işlemleri için başvuruları inceleyin
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Bekleyenler ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Ön Onaylananlar ({approvedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Reddedilenler ({rejectedApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {loading ? (
            <div className="text-center py-12">Yükleniyor...</div>
          ) : pendingApplications.length === 0 ? (
            <div className="text-center py-12">Bekleyen başvuru bulunmamaktadır</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <CardTitle>{application.user.firstName} {application.user.lastName}</CardTitle>
                    <CardDescription>{application.application.title}</CardDescription>
                    <Badge className="bg-yellow-400 text-yellow-900 mt-2 w-fit">Bekliyor</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">TC Kimlik:</span>
                        <span className="font-medium">{application.user.tcKimlikNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Üniversite:</span>
                        <span className="font-medium">{application.user.university || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sınıf:</span>
                        <span className="font-medium">{application.user.grade || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Başvuru Tarihi:</span>
                        <span className="font-medium">
                          {format(new Date(application.applicationDate), "dd.MM.yyyy")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button 
                      variant="destructive"
                      onClick={() => openRejectDialog(application)}
                      className="w-1/2"
                    >
                      Reddet
                    </Button>
                    <Button 
                      onClick={() => handleApprove(application.id)}
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
          ) : approvedApplications.length === 0 ? (
            <div className="text-center py-12">Ön onaylanan başvuru bulunmamaktadır</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {approvedApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <CardTitle>{application.user.firstName} {application.user.lastName}</CardTitle>
                    <CardDescription>{application.application.title}</CardDescription>
                    <Badge className="bg-green-100 text-green-800 mt-2 w-fit">Ön Onaylı</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">TC Kimlik:</span>
                        <span className="font-medium">{application.user.tcKimlikNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Üniversite:</span>
                        <span className="font-medium">{application.user.university || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sınıf:</span>
                        <span className="font-medium">{application.user.grade || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Başvuru Tarihi:</span>
                        <span className="font-medium">
                          {format(new Date(application.applicationDate), "dd.MM.yyyy")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Detaylar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {loading ? (
            <div className="text-center py-12">Yükleniyor...</div>
          ) : rejectedApplications.length === 0 ? (
            <div className="text-center py-12">Reddedilen başvuru bulunmamaktadır</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rejectedApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <CardTitle>{application.user.firstName} {application.user.lastName}</CardTitle>
                    <CardDescription>{application.application.title}</CardDescription>
                    <Badge className="bg-red-100 text-red-800 mt-2 w-fit">Reddedildi</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">TC Kimlik:</span>
                        <span className="font-medium">{application.user.tcKimlikNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Üniversite:</span>
                        <span className="font-medium">{application.user.university || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sınıf:</span>
                        <span className="font-medium">{application.user.grade || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Başvuru Tarihi:</span>
                        <span className="font-medium">
                          {format(new Date(application.applicationDate), "dd.MM.yyyy")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Detaylar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Başvuruyu Reddet</DialogTitle>
            <DialogDescription>
              Başvuruyu reddetme nedeninizi belirtin. Bu bilgi başvuru sahibine iletilecektir.
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
    </div>
  );
}