import { MOCK_QUIZZES } from '@/lib/data';
import { notFound } from 'next/navigation';
import { QuizClient } from '@/components/student/quiz-client';
import { StudentLayout } from '@/components/student/student-layout';

export default function QuizPage({ params }: { params: { id: string } }) {
  const quiz = MOCK_QUIZZES.find(q => q.code === params.id);

  if (!quiz) {
    notFound();
  }

  return (
    <StudentLayout>
      <QuizClient quiz={quiz} />
    </StudentLayout>
  );
}
