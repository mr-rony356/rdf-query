"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { dynamic } from "./config";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);

    // Simulate API call to save settings
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="query">Query Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  placeholder="RDF Query Builder"
                  defaultValue="RDF Query Builder"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  placeholder="A modern RDF query builder with role-based access control"
                  defaultValue="A modern RDF query builder with role-based access control"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put the site in maintenance mode
                  </p>
                </div>
                <Switch id="maintenance" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="registrations">Allow New Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable new user registrations
                  </p>
                </div>
                <Switch id="registrations" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveSettings}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactor">
                    Require Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Force users to set up 2FA for their accounts
                  </p>
                </div>
                <Switch id="twoFactor" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="passwordReset">Allow Password Reset</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable password reset functionality
                  </p>
                </div>
                <Switch id="passwordReset" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordPolicy">Password Policy</Label>
                <Select defaultValue="strong">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a password policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">
                  Session Timeout (minutes)
                </Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  defaultValue="60"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveSettings}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email notifications and templates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email Address</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  placeholder="noreply@example.com"
                  defaultValue="noreply@example.com"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="welcomeEmail">Send Welcome Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Send an email when a new user is approved
                  </p>
                </div>
                <Switch id="welcomeEmail" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="approvalEmail">Send Approval Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Send an email when a registration is approved
                  </p>
                </div>
                <Switch id="approvalEmail" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rejectionEmail">Send Rejection Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Send an email when a registration is rejected
                  </p>
                </div>
                <Switch id="rejectionEmail" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveSettings}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="query">
          <Card>
            <CardHeader>
              <CardTitle>Query Settings</CardTitle>
              <CardDescription>
                Configure RDF query behavior and limits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultQueryLimit">Default Query Limit</Label>
                <Input
                  id="defaultQueryLimit"
                  type="number"
                  min="1"
                  defaultValue="100"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of results to return by default
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="queryTimeout">Query Timeout (seconds)</Label>
                <Input
                  id="queryTimeout"
                  type="number"
                  min="1"
                  defaultValue="30"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum execution time for queries
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxQueryComplexity">
                  Maximum Query Complexity
                </Label>
                <Input
                  id="maxQueryComplexity"
                  type="number"
                  min="1"
                  defaultValue="10"
                />
                <p className="text-xs text-muted-foreground">
                  Limit the complexity of queries (e.g., number of joins)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cacheResults">Cache Query Results</Label>
                  <p className="text-sm text-muted-foreground">
                    Store query results in cache for better performance
                  </p>
                </div>
                <Switch id="cacheResults" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveSettings}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component to avoid errors, as it's used above but not imported
function Select({
  children,
  defaultValue,
}: {
  children: React.ReactNode;
  defaultValue: string;
}) {
  return <div>{children}</div>;
}

function SelectContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function SelectItem({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) {
  return <div>{children}</div>;
}

function SelectTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return <div className={className}>{children}</div>;
}

function SelectValue({ placeholder }: { placeholder: string }) {
  return <div>{placeholder}</div>;
}
