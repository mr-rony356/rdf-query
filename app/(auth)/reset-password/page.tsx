'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/lib/auth.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Database, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const formSchema = z
  .object({
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters.',
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Verify we have a valid recovery token in the URL
    const checkToken = async () => {
      try {
        // The recovery token is in the URL hash fragment
        // Supabase Browser SDK handles this automatically
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          setIsValidToken(false);
          setError("Invalid or expired reset token. Please try requesting a new password reset.");
          return;
        }
        
        setIsValidToken(true);
      } catch (error) {
        setIsValidToken(false);
        setError("Something went wrong. Please try again later.");
      }
    };

    checkToken();
  }, []);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(data.password);

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Success!
      toast({
        title: 'Password reset successful',
        description: 'You can now login with your new password.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        title: 'An error occurred',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  }

  if (isValidToken === null) {
    // Loading state
    return (
      <div className="container flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        <p className="mt-4 text-muted-foreground">Verifying your reset token...</p>
      </div>
    );
  }

  if (isValidToken === false) {
    // Invalid token
    return (
      <div className="container flex flex-col items-center justify-center py-10 md:py-16">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <h1 className="text-3xl font-bold">Invalid Reset Link</h1>
            <p className="text-muted-foreground">
              {error || "Your password reset link is invalid or has expired."}
            </p>
          </div>
          
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request a new reset link</Link>
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Or return to{' '}
                <Link
                  href="/login"
                  className="font-medium text-purple-600 hover:text-purple-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center justify-center py-10 md:py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Database className="h-10 w-10 text-purple-600" />
          <h1 className="text-3xl font-bold">Create a new password</h1>
          <p className="text-muted-foreground">
            Enter your new password below
          </p>
        </div>
        
        <div className="space-y-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...form.register('confirmPassword')}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}