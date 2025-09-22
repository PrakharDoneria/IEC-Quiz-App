'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StudentLayout } from '@/components/student/student-layout';
import { useToast } from '@/hooks/use-toast';
import { MOCK_QUIZZES } from '@/lib/data';

export default function StudentDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [quizCode, setQuizCode] = useState('');

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (MOCK_QUIZZES.find(q => q.code === quizCode)) {
      router.push(`/student/quiz/${quizCode}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'The quiz code you entered is not valid. Please try again.',
      });
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
                  onChange={(e) => setQuizCode(e.target.value)}
                  placeholder="e.g., MATH101"
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!quizCode}>
                Start Quiz
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
