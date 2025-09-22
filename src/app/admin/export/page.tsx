import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileOutput } from 'lucide-react';
import { ExportClient } from '@/components/admin/export-client';

export default function ExportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Export Student Data</h1>
        <p className="text-muted-foreground">
          Generate and download student data reports.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <FileOutput className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>AI-Powered Data Export</CardTitle>
            <CardDescription>
              Use AI to generate custom exports of student data.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ExportClient />
        </CardContent>
      </Card>
    </div>
  );
}
