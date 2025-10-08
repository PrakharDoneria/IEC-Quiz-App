
'use client';

import { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/student/student-layout';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PastResult {
    id: string;
    quizTitle: string;
    score: number;
    total: number;
    createdAt: any;
}

export default function StudentResultsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [pastResults, setPastResults] = useState<PastResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchResults = async () => {
        setLoadingResults(true);
        try {
          const resultsQuery = query(
            collection(firestore, 'results'),
            where('studentId', '==', user.uid)
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

          // Sort the results on the client-side
          resultsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          
          setPastResults(resultsData);
        } catch (error: any) {
          console.error("Error fetching past results:", error);
          toast({
            variant: 'destructive',
            title: 'Error Fetching Results',
            description: error.message || 'Could not fetch your past quiz results.',
          });
        } finally {
          setLoadingResults(false);
        }
      };
      fetchResults();
    }
  }, [user, toast]);

  return (
    <StudentLayout>
      <Card className="shadow-lg">
          <CardHeader>
              <CardTitle>Your Past Results</CardTitle>
              <CardDescription>A summary of all the quizzes you have completed.</CardDescription>
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
    </StudentLayout>
  );
}
