import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlertIcon, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="container flex flex-col items-center justify-center py-20">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
          <ShieldAlertIcon className="h-12 w-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold">Access Denied</h1>
        
        <p className="mt-4 text-muted-foreground">
          You don't have permission to access this page. If you believe this is an error, please contact your administrator.
        </p>
        
        <Button className="mt-8" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}