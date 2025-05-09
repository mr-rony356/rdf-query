import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RoleGuard } from "@/lib/role-guard";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RDF Query Builder",
  description: "A modern RDF query builder with role-based access control",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <RoleGuard>
            <div className="flex min-h-screen flex-col">
              <div className="mx-auto w-full max-w-[1320px]">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </div>
          </RoleGuard>
        </Providers>
      </body>
    </html>
  );
}
