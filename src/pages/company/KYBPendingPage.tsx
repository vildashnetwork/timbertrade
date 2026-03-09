import { Link } from 'react-router-dom';
import { Clock, FileText, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/useAuthStore';

export default function KYBPendingPage() {
  const { company } = useAuthStore();

  if (company?.status === 'SUSPENDED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="card-timber max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Account Suspended
            </h1>
            <p className="text-muted-foreground mb-6">
              Your company account has been suspended. Please contact our support
              team for assistance.
            </p>
            <Button variant="outline" asChild>
              <a href="mailto:support@timbertrade.cm">Contact Support</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="card-timber max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-status-pending" />
          </div>
          <CardTitle className="text-2xl">Verification In Progress</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Your company registration is currently under review. Our team is
            verifying your documents to ensure compliance with Cameroon timber
            export regulations.
          </p>

          <div className="p-4 bg-muted rounded-lg text-left">
            <h3 className="font-medium mb-3">Documents Submitted</h3>
            {company?.kybDocs && company.kybDocs.length > 0 ? (
              <ul className="space-y-2">
                {company.kybDocs.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>{doc.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({doc.type.replace(/_/g, ' ')})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No documents uploaded yet. Please upload your KYB documents to
                proceed.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              While you wait, you can browse our catalog. Ordering will be enabled
              once your account is approved.
            </p>
            <Button asChild className="btn-wood">
              <Link to="/company/catalog">
                Browse Catalog <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Verification typically takes 1-2 business days. For urgent requests,
              contact{' '}
              <a
                href="mailto:kyb@timbertrade.cm"
                className="text-secondary hover:underline"
              >
                kyb@timbertrade.cm
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}