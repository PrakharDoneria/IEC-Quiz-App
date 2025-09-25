
'use client';

import { Suspense, useEffect, useState } from 'react';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { QuizClient } from '@/components/student/quiz-client';
import { StudentLayout } from '@/components/student/student-layout';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Quiz } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
            <Dialog open={loading}>
                <DialogContent hideCloseButton>
                    <DialogHeader>
                        <DialogTitle className="text-center">Loading Your Quiz</DialogTitle>
                        <DialogDescription className="text-center">
                            Please wait while we prepare your questions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-8">
                        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </DialogContent>
            </Dialog>
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
