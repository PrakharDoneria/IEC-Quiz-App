'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { adminDataExportTool, AdminDataExportToolInput } from '@/ai/flows/admin-data-export-tool';
import { Loader2 } from 'lucide-react';

async function generateExport(input: AdminDataExportToolInput): Promise<string> {
  'use server';
  const { excelData } = await adminDataExportTool(input);
  return excelData;
}

export function ExportClient() {
  const [loading, setLoading] = useState<'top3' | 'all' | null>(null);
  const { toast } = useToast();

  const handleDownload = (base64Data: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: 'Download Started',
        description: `${fileName} is being downloaded.`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not prepare the file for download.',
      });
    }
  };

  const handleExport = async (filterType: 'top3' | 'all') => {
    setLoading(filterType);
    try {
      const excelData = await generateExport({ filterType });
      const fileName = `student_data_${filterType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      handleDownload(excelData, fileName);
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'An error occurred while generating the export file.',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground p-6">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Choose an export option below. The process may take a few moments.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => handleExport('top3')}
            disabled={!!loading}
            className="w-full sm:w-auto"
          >
            {loading === 'top3' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Export Top 3 per School
          </Button>
          <Button
            onClick={() => handleExport('all')}
            disabled={!!loading}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            {loading === 'all' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Export All Students
          </Button>
        </div>
      </div>
    </div>
  );
}
