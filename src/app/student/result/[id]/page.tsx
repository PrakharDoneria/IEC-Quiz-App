'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentLayout } from '@/components/student/student-layout';
import { CheckCircle2, Trophy } from 'lucide-react';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const score = searchParams.get('score') || '0';
  const total = searchParams.get('total') || '0';
  const percentage = total !== '0' ? (parseInt(score) / parseInt(total)) * 100 : 0;

  return (
    <StudentLayout>
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md text-center shadow-lg animate-in fade-in zoom-in-95">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Trophy className="h-10 w-10 text-accent" />
            </div>
            <CardTitle className="text-3xl font-bold">Quiz Completed!</CardTitle>
            <CardDescription>Here is your result.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-5xl font-bold text-primary">
              {score} / {total}
            </p>
            <p className="text-xl text-muted-foreground">
              You scored {percentage.toFixed(0)}%
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push('/student/dashboard')}>
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </StudentLayout>
  );
}


export default function ResultPage() {
    return (
        <Suspense fallback={<div>Loading result...</div>}>
            <ResultContent />
        </Suspense>
    )
}
