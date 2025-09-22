'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

const uploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  code: z.string().min(3, 'Code must be at least 3 characters.').max(10, 'Code cannot exceed 10 characters.'),
  file: z.any().refine((files) => files?.length === 1, 'Excel file is required.'),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function UploadQuizPage() {
  const { toast } = useToast();
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
  });
  
  const fileRef = form.register('file');

  function onSubmit(data: UploadFormValues) {
    console.log(data);
    toast({
      title: 'Quiz Created!',
      description: `Quiz "${data.title}" with code "${data.code}" has been created.`,
    });
    // In a real app, you'd use a library like 'xlsx' or 'papaparse' to process the file.
    toast({
      variant: 'default',
      title: 'File Processing Mocked',
      description: 'File upload is for demonstration only. No data was processed.',
    });
    form.reset({title: '', code: '', file: null});
  }

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Upload New Quiz</h1>
            <p className="text-muted-foreground">Create a new quiz by uploading an Excel file.</p>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
          <CardDescription>
            Provide a title, a unique code, and an Excel file with questions. The file should have columns: Que, Option 1, Option 2, Option 3, Option 4, Correct Answer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Advanced Calculus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unique Quiz Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CALC201" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Questions File (.xlsx)</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input type="file" accept=".xlsx, .xls" className="pl-10" {...fileRef} />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Create Quiz</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
