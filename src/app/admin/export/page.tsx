import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileOutput } from 'lucide-react';

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
            <CardTitle>Data Export</CardTitle>
            <CardDescription>
              The AI-powered data export tool has been removed.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This feature is no longer available.</p>
        </CardContent>
      </Card>
    </div>
  );
}
