
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StudentLayout } from '@/components/student/student-layout';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface PastResult {
    id: string;
    quizTitle: string;
    score: number;
    total: number;
    createdAt: any;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [quizCode, setQuizCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [pastResults, setPastResults] = useState<PastResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchResults = async () => {
        setLoadingResults(true);
        try {
          const resultsQuery = query(
            collection(firestore, 'results'),
            where('studentId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const resultsSnapshot = await getDocs(resultsQuery);

          const quizzesSnapshot = await getDocs(collection(firestore, 'quizzes'));
          const quizzesData: { [id: string]: string } = {};
          quizzesSnapshot.docs.forEach(doc => {
            quizzesData[doc.id] = doc.data().title;
          });

          const resultsData = resultsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              quizTitle: quizzesData[data.quizId] || 'Unknown Quiz',
              score: data.score,
              total: data.total,
              createdAt: data.createdAt?.toDate(),
            };
          });
          setPastResults(resultsData);
        } catch (error) {
          console.error("Error fetching past results:", error);
          toast({
            variant: 'destructive',
            title: 'Error Fetching Results',
            description: 'Could not fetch your past quiz results. Please ensure the necessary Firestore indexes are created.',
          });
        } finally {
          setLoadingResults(false);
        }
      };
      fetchResults();
    }
  }, [user, toast]);


  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizCode.trim()) {
        toast({
            variant: 'destructive',
            title: 'Invalid Code',
            description: 'Please enter a quiz code.',
        });
        return;
    }
    setLoading(true);
    try {
        const q = query(collection(firestore, 'quizzes'), where('code', '==', quizCode.toUpperCase()));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            toast({
                variant: 'destructive',
                title: 'Invalid Code',
                description: 'The quiz code you entered is not valid. Please try again.',
            });
        } else {
            const quizDoc = querySnapshot.docs[0];
            router.push(`/student/quiz/${quizDoc.id}`);
        }
    } catch (error) {
        console.error("Error finding quiz:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not verify quiz code. Please try again.',
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <StudentLayout>
        <div className="grid gap-8 lg:grid-cols-2">
            <div className="flex flex-col justify-center">
                 <Card className="w-full shadow-lg">
                    <CardHeader>
                        <CardTitle>Ready for a Challenge?</CardTitle>
                        <CardDescription>Enter the unique quiz code provided by your administrator to begin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleStartQuiz} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="quiz-code">Quiz Code</Label>
                            <Input
                            id="quiz-code"
                            value={quizCode}
                            onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                            placeholder="e.g., CALC201"
                            className="text-center text-lg tracking-widest"
                            autoCapitalize="characters"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!quizCode || loading}>
                            {loading ? 'Verifying...' : 'Start Quiz'}
                        </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Your Past Results</CardTitle>
                        <CardDescription>A summary of the quizzes you have completed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingResults ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : pastResults.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Quiz</TableHead>
                                        <TableHead className="text-center">Score</TableHead>
                                        <TableHead className="text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pastResults.map(result => (
                                        <TableRow key={result.id}>
                                            <TableCell className="font-medium">{result.quizTitle}</TableCell>
                                            <TableCell className="text-center">{result.score}/{result.total}</TableCell>
                                            <TableCell className="text-right">
                                                {result.createdAt ? format(result.createdAt, 'PP') : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted-foreground">You haven&apos;t completed any quizzes yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </StudentLayout>
  );
}
