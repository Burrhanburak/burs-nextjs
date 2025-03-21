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
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Document {
  id: string;
  userId: string;
  applicationId: string;
  type: string;
  name: string;
  url: string;
  status: string;
  uploadDate: string;
  verificationDate?: string;
  rejectionReason?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  application: {
    status: string;
  };
}

const documentTypes = {
  transcript: 'Transkript',
  id_card: 'Kimlik Kartı',
  income_statement: 'Gelir Belgesi',
  residence_permit: 'İkametgah Belgesi',
  student_certificate: 'Öğrenci Belgesi',
};

export function DocumentVerification() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Evraklar yüklenirken bir hata oluştu.');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Hata',
        description: 'Evraklar yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (documentId: string, status: string, rejectionReason?: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, rejectionReason }),
      });

      if (!response.ok) {
        throw new Error('Evrak durumu güncellenirken bir hata oluştu.');
      }

      toast({
        title: 'Başarılı',
        description: 'Evrak durumu güncellendi.',
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: 'Hata',
        description: 'Evrak durumu güncellenirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const filteredDocuments = documents.filter((document) => {
    const matchesFilter = filter === 'all' || document.status === filter;
    const matchesSearch = search === '' || 
      document.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      document.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      document.name.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="İsim veya evrak adı ile ara..."
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
            <SelectItem value="approved">Onaylandı</SelectItem>
            <SelectItem value="rejected">Reddedildi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evrak Türü</TableHead>
              <TableHead>Evrak Adı</TableHead>
              <TableHead>Başvuran</TableHead>
              <TableHead>Yükleme Tarihi</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((document) => (
              <TableRow key={document.id}>
                <TableCell>{documentTypes[document.type as keyof typeof documentTypes]}</TableCell>
                <TableCell>{document.name}</TableCell>
                <TableCell>
                  {document.user.firstName} {document.user.lastName}
                </TableCell>
                <TableCell>
                  {new Date(document.uploadDate).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    document.status === 'approved' ? 'bg-green-100 text-green-800' :
                    document.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {document.status === 'approved' ? 'Onaylandı' :
                     document.status === 'rejected' ? 'Reddedildi' :
                     'Beklemede'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDocument(document)}
                        >
                          Görüntüle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Evrak Görüntüleme</DialogTitle>
                        </DialogHeader>
                        <div className="aspect-video relative">
                          <iframe
                            src={document.url}
                            className="w-full h-full"
                            title={document.name}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>

                    {document.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerification(document.id, 'approved')}
                        >
                          Onayla
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const reason = prompt('Red sebebini giriniz:');
                            if (reason) {
                              handleVerification(document.id, 'rejected', reason);
                            }
                          }}
                        >
                          Reddet
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