'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StudentLayout } from '@/components/student/student-layout';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function StudentDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [quizCode, setQuizCode] = useState('');
  const [loading, setLoading] = useState(false);

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
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
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
    </StudentLayout>
  );
}
