import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileOutput, Frown } from 'lucide-react';

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
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
            <Frown className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <CardTitle>Feature Not Available</CardTitle>
            <CardDescription>
              The AI-Powered Data Export feature has been removed.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>This feature was powered by a service that is no longer available. Please check back later for updates.</p>
        </CardContent>
      </Card>
    </div>
  );
}
