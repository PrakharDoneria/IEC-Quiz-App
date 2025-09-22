'use client';

import { Suspense, useEffect, useState } from 'react';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { QuizClient } from '@/components/student/quiz-client';
import { StudentLayout } from '@/components/student/student-layout';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Quiz } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

function QuizPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  const questionParam = searchParams.get('question');
  const questionNumber = questionParam ? parseInt(questionParam, 10) : 1;

  useEffect(() => {
    if (!id) return;

    const fetchQuiz = async () => {
      try {
        const quizDoc = await getDoc(doc(firestore, 'quizzes', id));
        if (quizDoc.exists()) {
          setQuiz({ id: quizDoc.id, ...quizDoc.data() } as Quiz);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  if (loading) {
    return (
        <StudentLayout>
            <div className="flex-1 flex flex-col justify-center items-center">
                <div className="w-full max-w-2xl space-y-4">
                    <Skeleton className="h-8 w-1/2 mx-auto" />
                    <Skeleton className="h-4 w-1/4 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                    <div className="border rounded-md p-6 space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <div className="space-y-2">
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    )
  }

  if (!quiz) {
    // This case will be handled by notFound in useEffect, but as a fallback
    return notFound();
  }

  return (
    <StudentLayout>
      <QuizClient quiz={quiz} questionNumber={questionNumber} />
    </StudentLayout>
  );
}

export default function QuizPage() {
    return (
        <Suspense fallback={
            <StudentLayout>
                <div className="flex-1 flex flex-col justify-center items-center">
                    <div className="w-full max-w-2xl space-y-4">
                        <Skeleton className="h-8 w-1/2 mx-auto" />
                    </div>
                </div>
            </StudentLayout>
        }>
            <QuizPageContent />
        </Suspense>
    )
}
