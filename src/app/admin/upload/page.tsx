'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload } from 'lucide-react';
import { firestore } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { Question } from '@/lib/data';
import { useState } from 'react';

const uploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  code: z.string().min(3, 'Code must be at least 3 characters.').max(10, 'Code cannot exceed 10 characters.'),
  file: z.any().refine((files) => files?.length === 1, 'Excel file is required.'),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function UploadQuizPage() {
  const { toast } = useToast();
  const [templateDownloaded, setTemplateDownloaded] = useState(false);
  
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      code: '',
      file: null,
    }
  });
  
  const fileRef = form.register('file');

  const handleDownload = () => {
    const sampleData = [
        ['Question', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Correct Answer'],
        ['What is the capital of France?', 'Berlin', 'Madrid', 'Paris', 'Rome', 'Paris']
    ];
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quiz Template");
    XLSX.writeFile(wb, "quiz_template.xlsx");
    setTemplateDownloaded(true);
  }

  const parseExcelFile = (file: File): Promise<Question[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const bstr = event.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

                // Remove header row
                const rows = data.slice(1);
                
                const questions: Question[] = rows.map((row, index) => {
                    const [question, ...optionsAndAnswer] = row;
                    const options = optionsAndAnswer.slice(0, 4);
                    const correctAnswer = optionsAndAnswer[4];
                    if (!question || options.length < 4 || !correctAnswer) {
                        throw new Error(`Invalid data in row ${index + 2}`);
                    }
                    return {
                        id: `q${index + 1}`,
                        question,
                        options,
                        correctAnswer,
                    };
                });
                resolve(questions);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
  }

  async function onSubmit(data: UploadFormValues) {
    const file = data.file[0];
    try {
        const questions = await parseExcelFile(file);
        
        await addDoc(collection(firestore, 'quizzes'), {
            title: data.title,
            code: data.code.toUpperCase(),
            questions: questions,
        });

        toast({
            title: 'Quiz Created!',
            description: `Quiz "${data.title}" with code "${data.code}" has been created.`,
        });
        form.reset({title: '', code: '', file: null});
        // This will allow a user to re-upload the same file name
        if(fileRef?.ref) {
            (fileRef.ref as HTMLInputElement).value = '';
        }
        setTemplateDownloaded(false);
    } catch (error) {
        console.error("Error processing file or adding document: ", error);
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'Could not create the quiz. Please check the file format and try again.',
        });
    }
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
                Provide a title, a unique code, and an Excel file with questions.
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
              
              <FormItem>
                <FormLabel>Questions File (.xlsx)</FormLabel>
                <p className='text-xs text-muted-foreground'>The file should have columns: Question, Option 1, Option 2, Option 3, Option 4, Correct Answer.</p>
                
                {!templateDownloaded ? (
                    <Button onClick={handleDownload} type="button" variant="secondary" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Template
                    </Button>
                ) : (
                    <FormField
                        control={form.control}
                        name="file"
                        render={({ field }) => (
                        <FormItem className='!mt-2'>
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
                )}
              </FormItem>

              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting || !templateDownloaded}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Quiz'}
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
