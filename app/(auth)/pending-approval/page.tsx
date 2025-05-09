'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { HourglassIcon, Database, ArrowLeft } from 'lucide-react';

export default function PendingApprovalPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // If the user is already approved, redirect them to dashboard
  useEffect(() => {
    if (user && user.role !== 'guest') {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="container flex flex-col items-center justify-center py-10 md:py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex items-center justify-center p-4 bg-purple-100 dark:bg-purple-900/20 rounded-full">
            <HourglassIcon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Registration Pending</h1>
            <p className="mt-2 text-muted-foreground">
              Your account is waiting for admin approval
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-card rounded-lg border shadow-sm p-6">
          <p className="text-center mb-4">
            Thank you for registering! An administrator will review your account request.
            You'll receive an email notification once your account is approved.
          </p>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">While you're waiting:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Make sure to check your email including spam folder</li>
              <li>You can return to this page to check your approval status</li>
              <li>Contact support if you haven't received approval within 48 hours</li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3">
          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-100"
            onClick={() => signOut()}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}