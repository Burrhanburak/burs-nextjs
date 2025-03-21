'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Application {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    tcKimlikNo: string;
  };
  status: string;
  applicationDate: string;
  documents: any[];
}

export function ApplicationList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (!response.ok) {
        throw new Error('Başvurular yüklenirken bir hata oluştu.');
      }
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Hata',
        description: 'Başvurular yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Durum güncellenirken bir hata oluştu.');
      }

      toast({
        title: 'Başarılı',
        description: 'Başvuru durumu güncellendi.',
      });

      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Hata',
        description: 'Durum güncellenirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const filteredApplications = applications.filter((application) => {
    const matchesFilter = filter === 'all' || application.status === filter;
    const matchesSearch = search === '' || 
      application.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      application.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      application.user.tcKimlikNo.includes(search);
    
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="İsim veya TC Kimlik No ile ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Durum Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="pending">Beklemede</SelectItem>
            <SelectItem value="pre_approved">Ön Onay</SelectItem>
            <SelectItem value="pre_rejected">Ön Red</SelectItem>
            <SelectItem value="document_required">Evrak Gerekli</SelectItem>
            <SelectItem value="documents_submitted">Evrak Yüklendi</SelectItem>
            <SelectItem value="documents_approved">Evrak Onaylandı</SelectItem>
            <SelectItem value="documents_rejected">Evrak Reddedildi</SelectItem>
            <SelectItem value="interview_scheduled">Mülakat Planlandı</SelectItem>
            <SelectItem value="interview_completed">Mülakat Tamamlandı</SelectItem>
            <SelectItem value="final_approved">Kesin Onay</SelectItem>
            <SelectItem value="final_rejected">Kesin Red</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başvuru No</TableHead>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>TC Kimlik No</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Başvuru Tarihi</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>{application.id.slice(0, 8)}</TableCell>
                <TableCell>
                  {application.user.firstName} {application.user.lastName}
                </TableCell>
                <TableCell>{application.user.tcKimlikNo}</TableCell>
                <TableCell>{application.user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    application.status === 'final_approved' ? 'bg-green-100 text-green-800' :
                    application.status === 'final_rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {application.status}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(application.applicationDate).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {application.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(application.id, 'pre_approved')}
                        >
                          Ön Onay
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(application.id, 'pre_rejected')}
                        >
                          Red
                        </Button>
                      </>
                    )}
                    {application.status === 'pre_approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(application.id, 'document_required')}
                      >
                        Evrak İste
                      </Button>
                    )}
                    {application.status === 'documents_submitted' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(application.id, 'documents_approved')}
                        >
                          Evrak Onayla
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(application.id, 'documents_rejected')}
                        >
                          Evrak Reddet
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 