'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface ApplicationStatusProps {
  application: {
    status: string;
    applicationDate: string;
    preApprovalDate?: string;
    preRejectionDate?: string;
    preRejectionReason?: string;
    documentSubmissionDate?: string;
    documentApprovalDate?: string;
    documentRejectionDate?: string;
    documentRejectionReason?: string;
    interviewDate?: string;
    interviewResult?: string;
    interviewNotes?: string;
    finalApprovalDate?: string;
    finalRejectionDate?: string;
    finalRejectionReason?: string;
  } | null;
}

const statusSteps = [
  { key: 'pending', label: 'Başvuru Alındı' },
  { key: 'pre_approved', label: 'Ön Onay' },
  { key: 'document_required', label: 'Evrak Yükleme' },
  { key: 'documents_submitted', label: 'Evrak Kontrolü' },
  { key: 'interview_scheduled', label: 'Mülakat' },
  { key: 'final_approved', label: 'Kesin Onay' },
];

export function ApplicationStatus({ application }: ApplicationStatusProps) {
  if (!application) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Henüz başvuru yapılmamış.</p>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(step => step.key === application.status);
  const progress = ((currentStepIndex + 1) / statusSteps.length) * 100;

  const getStatusMessage = () => {
    switch (application.status) {
      case 'pending':
        return 'Başvurunuz alınmıştır. En kısa sürede incelenecektir.';
      case 'pre_approved':
        return 'Başvurunuz ön onay almıştır. Lütfen gerekli evrakları yükleyin.';
      case 'pre_rejected':
        return `Başvurunuz reddedilmiştir. Sebep: ${application.preRejectionReason}`;
      case 'document_required':
        return 'Lütfen gerekli evrakları yükleyin.';
      case 'documents_submitted':
        return 'Evraklarınız incelenmektedir.';
      case 'documents_approved':
        return 'Evraklarınız onaylanmıştır. Mülakat tarihi belirlenecektir.';
      case 'documents_rejected':
        return `Evraklarınız reddedilmiştir. Sebep: ${application.documentRejectionReason}`;
      case 'interview_scheduled':
        return `Mülakat tarihiniz: ${new Date(application.interviewDate!).toLocaleDateString('tr-TR')}`;
      case 'interview_completed':
        return 'Mülakatınız tamamlanmıştır. Sonuç en kısa sürede bildirilecektir.';
      case 'final_approved':
        return 'Tebrikler! Başvurunuz kesin onay almıştır.';
      case 'final_rejected':
        return `Başvurunuz reddedilmiştir. Sebep: ${application.finalRejectionReason}`;
      default:
        return 'Başvuru durumu bilinmiyor.';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-gray-500">
          {statusSteps.map((step, index) => (
            <div
              key={step.key}
              className={`text-center ${
                index <= currentStepIndex ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Başvuru Durumu</h3>
              <p className="text-sm text-gray-500">{getStatusMessage()}</p>
            </div>

            {application.interviewDate && (
              <div>
                <h3 className="font-medium">Mülakat Bilgileri</h3>
                <p className="text-sm text-gray-500">
                  Tarih: {new Date(application.interviewDate).toLocaleDateString('tr-TR')}
                </p>
              </div>
            )}

            {application.interviewResult && (
              <div>
                <h3 className="font-medium">Mülakat Sonucu</h3>
                <p className="text-sm text-gray-500">
                  {application.interviewResult === 'passed' ? 'Başarılı' : 'Başarısız'}
                </p>
                {application.interviewNotes && (
                  <p className="text-sm text-gray-500 mt-1">
                    Notlar: {application.interviewNotes}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 