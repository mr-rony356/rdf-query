"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Database, Search, ShieldCheck, GitMerge } from "lucide-react";
import { useAuth } from "@/lib/auth";
export default function Home() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-background mx-auto max-w-7xl">
      {/* Hero section */}
      <section className="relative">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background" />

        <div className="container relative pt-20 pb-24 md:pt-32 md:pb-40 ">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-900/20">
                <Database className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Modern RDF Query{" "}
              <span className="text-purple-600 dark:text-purple-400">
                Builder
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mb-8 md:mb-12">
              Build, visualize, and execute SPARQL queries with an intuitive
              interface. Explore semantic data with role-based access and
              powerful query tools.
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  asChild
                >
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 md:py-24 bg-white dark:bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides everything you need to work with RDF data
              effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border">
              <div className="p-3 mb-4 rounded-full w-fit bg-purple-100 dark:bg-purple-900/20">
                <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Visual Query Building
              </h3>
              <p className="text-muted-foreground">
                Create complex SPARQL queries using our intuitive drag-and-drop
                interface. No need to write queries from scratch.
              </p>
            </div>

            <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border">
              <div className="p-3 mb-4 rounded-full w-fit bg-purple-100 dark:bg-purple-900/20">
                <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Fine-grained control with guest, user and admin roles. Ensure
                data security and appropriate access levels.
              </p>
            </div>

            <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border">
              <div className="p-3 mb-4 rounded-full w-fit bg-purple-100 dark:bg-purple-900/20">
                <GitMerge className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Query Management</h3>
              <p className="text-muted-foreground">
                Save, share, and reuse your frequently used queries. Keep track
                of query history and execution statistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 md:py-24 bg-purple-50 dark:bg-purple-950/10">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to explore semantic data?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Create an account today and start building powerful RDF queries
                in minutes. Join our community of semantic web enthusiasts.
              </p>
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                asChild
              >
                <Link href="/register">Register Now</Link>
              </Button>
            </div>

            <div className="flex-1">
              <div className="bg-white dark:bg-card p-6 rounded-xl shadow-lg border">
                <h3 className="text-xl font-semibold mb-4">
                  Example SPARQL Query
                </h3>
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto text-sm">
                  <code>{`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?subject ?label
WHERE {
  ?subject rdf:type <http://example.org/Person> .
  ?subject rdfs:label ?label .
}
LIMIT 10`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
