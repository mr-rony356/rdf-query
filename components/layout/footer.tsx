import Link from 'next/link';
import { Database } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full py-6 md:py-8 border-t">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            <span className="font-bold text-lg">RDF Query Builder</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} RDF Query Builder. All rights reserved.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}