'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertCircle, Play, Save, Code, Table, Database, X, Search, Download, Copy, Share2, Loader2, Upload, FileText, FileInput } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';

const saveQuerySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

type SaveQueryFormValues = z.infer<typeof saveQuerySchema>;

const supportedFileTypes = [
  '.ttl', '.rdf', '.rdfs', '.owl', '.n3', '.nt', '.jsonld', '.xml'
];

export default function QueryBuilderPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState<string>(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?subject ?predicate ?object
WHERE {
  ?subject ?predicate ?object .
}
LIMIT 10`);
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('table');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const form = useForm<SaveQueryFormValues>({
    resolver: zodResolver(saveQuerySchema),
    defaultValues: {
      title: '',
      description: '',
      isPublic: false,
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/turtle': ['.ttl'],
      'application/rdf+xml': ['.rdf', '.rdfs', '.owl'],
      'text/n3': ['.n3'],
      'application/n-triples': ['.nt'],
      'application/ld+json': ['.jsonld'],
      'application/xml': ['.xml']
    },
    maxFiles: 5,
    multiple: true
  });

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/rdf/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload files');
      }

      const data = await response.json();
      toast({
        title: 'Files uploaded successfully',
        description: `Uploaded ${uploadedFiles.length} file(s)`,
      });
      
      setUploadedFiles([]);
      setShowUploadDialog(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const runQuery = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      const response = await fetch('/api/rdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to execute query');
      }

      const data = await response.json();
      setResults(data.results);
      
      toast({
        title: 'Query executed successfully',
        description: `Executed in ${data.results.execution_time || '123'}ms`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Query execution failed',
        description: error.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const saveQuery = async (formData: SaveQueryFormValues) => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/rdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          saveQuery: true,
          title: formData.title,
          description: formData.description,
          isPublic: formData.isPublic,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save query');
      }

      toast({
        title: 'Query saved successfully',
        description: 'Your query has been saved to your account',
      });
      
      setShowSaveDialog(false);
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to save query',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderTableHeader = () => {
    if (!results || !results.head || !results.head.vars) return null;
    
    return (
      <thead>
        <tr className="border-b">
          {results.head.vars.map((variable: string) => (
            <th key={variable} className="h-10 px-4 text-left align-middle font-medium">
              {variable}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  const renderTableBody = () => {
    if (!results || !results.results || !results.results.bindings) return null;
    
    return (
      <tbody>
        {results.results.bindings.map((binding: any, index: number) => (
          <tr key={index} className="border-b transition-colors hover:bg-muted/50">
            {results.head.vars.map((variable: string) => (
              <td key={`${index}-${variable}`} className="p-4 align-middle">
                {binding[variable] ? (
                  <div className="flex flex-col">
                    <span className="font-mono text-sm">
                      {binding[variable].value.length > 50 
                        ? binding[variable].value.substring(0, 50) + '...' 
                        : binding[variable].value}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {binding[variable].type}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">null</span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  const copyQueryToClipboard = () => {
    navigator.clipboard.writeText(query);
    toast({
      title: 'Copied to clipboard',
      description: 'Query has been copied to clipboard',
    });
  };

  const downloadResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'query-results.json');
    linkElement.click();
  };

  return (
    <div className="container py-6 flex flex-col min-h-[calc(100vh-16rem)]">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Query Builder</h1>
        <p className="text-muted-foreground">
          Create and execute SPARQL queries against our RDF database or your own uploaded files
        </p>
      </div>

      {/* Upload Files Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Upload RDF Files</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowUploadDialog(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {uploadedFiles.length > 0 ? (
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFile(index)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileInput className="h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No files uploaded</h3>
              <p className="mt-2 text-muted-foreground max-w-md">
                Upload RDF files (TTL, RDF/XML, N-Triples, etc.) to query against them
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Query Editor</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyQueryToClipboard}
                className="h-8"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              {user && user.role !== 'guest' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowSaveDialog(true)}
                  className="h-8"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              )}
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700 h-8"
                onClick={runQuery}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Run
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="relative">
            <Textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-mono h-[500px] resize-none p-4"
              placeholder="Enter your SPARQL query here..."
            />
            {!query && (
              <div className="absolute top-1/3 left-0 right-0 flex flex-col items-center text-muted-foreground">
                <Database className="h-12 w-12 mb-2 opacity-20" />
                <p>Start writing your SPARQL query</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Results</h2>
            <div className="flex items-center gap-2">
              {results && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadResults}
                    className="h-8"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  {user && user.role !== 'guest' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <Card className="h-[500px] overflow-hidden">
            {isRunning ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <p className="mt-4 text-muted-foreground">Executing query...</p>
                </div>
              </div>
            ) : results ? (
              <CardContent className="p-0 h-full">
                <Tabs defaultValue="table" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <div className="border-b px-3">
                    <TabsList className="h-10">
                      <TabsTrigger value="table" className="flex items-center gap-1">
                        <Table className="h-4 w-4" />
                        Table
                      </TabsTrigger>
                      <TabsTrigger value="json" className="flex items-center gap-1">
                        <Code className="h-4 w-4" />
                        JSON
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="table" className="flex-1 overflow-auto p-0 data-[state=active]:flex data-[state=active]:flex-col">
                    <div className="rounded-md border overflow-auto h-full">
                      <table className="w-full caption-bottom">
                        {renderTableHeader()}
                        {renderTableBody()}
                      </table>
                    </div>
                  </TabsContent>
                  <TabsContent value="json" className="p-0 flex-1 overflow-auto data-[state=active]:flex data-[state=active]:flex-col">
                    <pre className="p-4 bg-muted/30 font-mono text-sm rounded-md h-full overflow-auto">
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center text-center px-4">
                  <Search className="h-12 w-12 text-muted-foreground opacity-20" />
                  <h3 className="mt-4 text-lg font-medium">No Results</h3>
                  <p className="mt-2 text-muted-foreground max-w-md">
                    Execute a query to see the results here. Results will appear in table and JSON formats.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Save Query Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Query</DialogTitle>
            <DialogDescription>
              Save this query to your account for future use.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(saveQuery)}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="Enter a descriptive title"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter a description for this query"
                  className="resize-none"
                  rows={3}
                  {...form.register('description')}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isPublic" 
                  {...form.register('isPublic')}
                />
                <Label 
                  htmlFor="isPublic"
                  className="text-sm font-normal"
                >
                  Make this query public (visible to all users)
                </Label>
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Query
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Files Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Upload RDF Files</DialogTitle>
            <DialogDescription>
              Upload RDF files in Turtle, RDF/XML, N-Triples, or JSON-LD format (max 5 files)
            </DialogDescription>
          </DialogHeader>
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-purple-500 bg-purple-50/50' : 'border-muted-foreground/30'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-3">
              <Upload className="h-10 w-10 text-muted-foreground" />
              {isDragActive ? (
                <p className="font-medium text-purple-600">Drop the files here</p>
              ) : (
                <>
                  <p className="font-medium">Drag & drop files here, or click to select</p>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: {supportedFileTypes.join(', ')}
                  </p>
                </>
              )}
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
              <h4 className="text-sm font-medium">Selected files:</h4>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFile(index)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowUploadDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={uploadFiles}
              disabled={uploadedFiles.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}