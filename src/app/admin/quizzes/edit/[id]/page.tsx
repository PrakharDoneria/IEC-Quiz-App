
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Clock, ArrowLeft } from 'lucide-react';
import { firestore } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { Question, Quiz } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const editSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  code: z.string().min(3, 'Code must be at least 3 characters.').max(10, 'Code cannot exceed 10 characters.'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute.'),
  file: z.any().optional(), // File is optional now
});

type EditFormValues = z.infer<typeof editSchema>;

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  const fileRef = form.register('file');

  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const docRef = doc(firestore, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const quizData = { id: docSnap.id, ...docSnap.data() } as Quiz;
          setQuiz(quizData);
          form.reset({
            title: quizData.title,
            code: quizData.code,
            duration: quizData.duration ? quizData.duration / 60 : 10,
          });
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch quiz data.' });
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, form, toast]);

  const parseExcelFile = (file: File): Promise<Question[]> => {
    return new Promise(async (resolve, reject) => {
        const XLSX = await import('xlsx');
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const bstr = event.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

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

  async function onSubmit(data: EditFormValues) {
    const file = data.file?.[0];
    try {
        let updatedQuestions: Question[] | undefined;
        if (file) {
            updatedQuestions = await parseExcelFile(file);
        }

        const updateData: Partial<Quiz> = {
            title: data.title,
            code: data.code.toUpperCase(),
            duration: data.duration * 60, // Convert minutes to seconds
        };
        
        if (updatedQuestions) {
            updateData.questions = updatedQuestions;
        }

        await updateDoc(doc(firestore, 'quizzes', quizId), updateData);

        toast({
            title: 'Quiz Updated!',
            description: `Quiz "${data.title}" has been successfully updated.`,
        });
        router.push('/admin/quizzes');
    } catch (error) {
        console.error("Error updating document: ", error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update the quiz. Please check any uploaded files and try again.',
        });
    }
  }
  
  if (loading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-8 w-48" />
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </div>
                     <Skeleton className="h-14 w-full" />
                     <Skeleton className="h-20 w-full" />
                     <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Quiz</h1>
            <p className="text-muted-foreground">Update the details for "{quiz?.title}".</p>
        </div>
      <Card>
        <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
            <CardDescription>
                Modify the quiz title, code, and duration. You can also replace all questions by uploading a new file.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-4">
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
                </div>
                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Duration (in minutes)</FormLabel>
                        <FormControl>
                            <div className='relative'>
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="number" placeholder="e.g., 60" {...field} className='pl-10' />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

              <FormItem>
                <FormLabel>Replace Questions (.xlsx)</FormLabel>
                <p className='text-xs text-muted-foreground'>To replace questions, upload a new Excel file. If no file is uploaded, the existing questions will be kept.</p>
                
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
              </FormItem>

              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
