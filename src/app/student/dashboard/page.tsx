
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
import { collection, getDocs, query, where, limit, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { LogIn, History } from 'lucide-react';
import type { Result } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { UpdateRollNumberDialog } from '@/components/student/update-roll-number-dialog';


interface PastResult extends Result {
  quizTitle: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [quizCode, setQuizCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentResults, setRecentResults] = useState<PastResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [showRollNumberDialog, setShowRollNumberDialog] = useState(false);


  useEffect(() => {
    if (!authLoading && user && userProfile) {
        if (!userProfile.boardRollNumber) {
            setShowRollNumberDialog(true);
        } else {
            setShowRollNumberDialog(false);
        }
    }
  }, [user, userProfile, authLoading]);

  useEffect(() => {
    if (user) {
      const fetchRecentResults = async () => {
        setLoadingResults(true);
        try {
          const resultsQuery = query(
            collection(firestore, 'results'),
            where('studentId', '==', user.uid)
          );
          const resultsSnapshot = await getDocs(resultsQuery);
          
          if (resultsSnapshot.empty) {
            setRecentResults([]);
            setLoadingResults(false);
            return;
          }

          const quizzesSnapshot = await getDocs(collection(firestore, 'quizzes'));
          const quizzesData: { [id: string]: string } = {};
          quizzesSnapshot.forEach(doc => {
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
            } as PastResult;
          });
          
          // Sort on the client side and take the top 3
          resultsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          setRecentResults(resultsData.slice(0, 3));

        } catch (error) {
          console.error("Error fetching recent results:", error);
        } finally {
          setLoadingResults(false);
        }
      };
      fetchRecentResults();
    }
  }, [user]);
  
  const handleRollNumberUpdate = async (rollNumber: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(firestore, 'users', user.uid), {
        boardRollNumber: rollNumber,
      });
      toast({ title: 'Success', description: 'Your roll number has been updated.' });
      setShowRollNumberDialog(false);
    } catch (error) {
      console.error('Failed to update roll number', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your roll number. Please try again.',
      });
    }
  };


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
    if (!user) {
        toast({ variant: 'destructive', title: 'Not Logged In', description: 'Please log in to start a quiz.'});
        return;
    }

    setLoading(true);
    try {
        const q = query(collection(firestore, 'quizzes'), where('code', '==', quizCode.toUpperCase()), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            toast({
                variant: 'destructive',
                title: 'Invalid Code',
                description: 'The quiz code you entered is not valid. Please try again.',
            });
        } else {
            const quizDoc = querySnapshot.docs[0];
            const quizId = quizDoc.id;

            const resultsQuery = query(
                collection(firestore, 'results'), 
                where('studentId', '==', user.uid),
                where('quizId', '==', quizId),
                limit(1)
            );
            const resultsSnapshot = await getDocs(resultsQuery);

            if (!resultsSnapshot.empty) {
                toast({
                    variant: 'destructive',
                    title: 'Quiz Already Attempted',
                    description: 'You have already completed this quiz.',
                });
            } else {
                 router.push(`/student/quiz/${quizId}`);
            }
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
      <UpdateRollNumberDialog 
        open={showRollNumberDialog}
        onSave={handleRollNumberUpdate}
      />
      <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {userProfile?.name?.split(' ')[0] || 'Student'}!</h1>
            <p className="text-muted-foreground">Ready to test your knowledge? Enter a quiz code or review your past results.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-1 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LogIn className="h-5 w-5 text-primary" />
                    <span>Start a New Quiz</span>
                </CardTitle>
                <CardDescription>Enter the unique quiz code to begin.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleStartQuiz} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="quiz-code" className="sr-only">Quiz Code</Label>
                    <Input
                    id="quiz-code"
                    value={quizCode}
                    onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                    placeholder="ENTER QUIZ CODE"
                    className="text-center text-lg tracking-widest font-mono h-12"
                    autoCapitalize="characters"
                    />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base" disabled={!quizCode || loading}>
                    {loading ? 'Verifying...' : 'Start Quiz'}
                </Button>
                </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className='flex items-center gap-2'>
                        <History className="h-5 w-5 text-primary" />
                        <span>Recent Activity</span>
                    </div>
                    <Button variant="link" asChild>
                        <Link href="/student/results">View All</Link>
                    </Button>
                </CardTitle>
                 <CardDescription>Your last 3 quiz attempts.</CardDescription>
            </CardHeader>
            <CardContent>
                 {loadingResults ? (
                  <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                  </div>
              ) : recentResults.length > 0 ? (
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Quiz</TableHead>
                              <TableHead className="text-center">Score</TableHead>
                              <TableHead className="text-right">Date</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {recentResults.map(result => (
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
                  <p className="text-center text-muted-foreground py-8">You haven&apos;t completed any quizzes yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
