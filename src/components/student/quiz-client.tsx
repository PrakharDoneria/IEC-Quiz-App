'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, notFound } from 'next/navigation';
import type { Quiz } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogCancel, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { firestore, auth } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { PanelLeft } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


type Answers = Record<string, string>;

interface QuizClientProps {
    quiz: Quiz;
    questionNumber: number;
}

function QuestionPalette({
    totalQuestions,
    answers,
    currentQuestionIndex,
    onQuestionSelect,
}: {
    totalQuestions: number;
    answers: Answers;
    currentQuestionIndex: number;
    onQuestionSelect: (qNumber: number) => void;
}) {
    return (
        <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: totalQuestions }).map((_, i) => {
                const questionId = `q${i + 1}`;
                const isAttempted = answers.hasOwnProperty(questionId);
                const isCurrent = i === currentQuestionIndex;

                return (
                    <Button
                        key={i}
                        variant={isAttempted ? 'default' : 'outline'}
                        className={cn(
                            "h-10 w-10 p-0",
                            isCurrent && "ring-2 ring-primary ring-offset-2",
                             isAttempted ? 'bg-green-600 hover:bg-green-700 text-white': ''
                        )}
                        onClick={() => onQuestionSelect(i + 1)}
                    >
                        {i + 1}
                    </Button>
                );
            })}
        </div>
    );
}


export function QuizClient({ quiz, questionNumber }: QuizClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const isMobile = useIsMobile();
  
  const [answers, setAnswers] = useState<Answers>(() => {
    if (typeof window !== 'undefined') {
        const savedAnswers = sessionStorage.getItem(`quiz-${quiz.id}-answers`);
        return savedAnswers ? JSON.parse(savedAnswers) : {};
    }
    return {};
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentQuestionIndex = questionNumber - 1;
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(`quiz-${quiz.id}-answers`, JSON.stringify(answers));
    }
  }, [answers, quiz.id]);

  if (currentQuestionIndex < 0 || currentQuestionIndex >= quiz.questions.length) {
    return notFound();
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleOptionChange = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
        toast({
            variant: "destructive",
            title: "Please select an answer",
            description: "You must select an answer before proceeding.",
        });
        return;
    }
    if (currentQuestionIndex < quiz.questions.length - 1) {
      router.push(`${pathname}?question=${questionNumber + 1}`);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      router.push(`${pathname}?question=${questionNumber - 1}`);
    }
  };

  const handleQuestionSelect = (qNumber: number) => {
      router.push(`${pathname}?question=${qNumber}`);
  }
  
  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (!user || !userProfile) {
        toast({
            variant: "destructive",
            title: "Not Authenticated",
            description: "You must be logged in to submit a quiz.",
        });
        setIsSubmitting(false);
        router.push('/login');
        return;
    }


    let score = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    try {
        const resultData = {
            quizId: quiz.id,
            studentId: user.uid,
            studentName: userProfile.name,
            schoolName: userProfile.schoolName,
            score: score,
            total: quiz.questions.length,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(firestore, "results"), resultData);
        
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(`quiz-${quiz.id}-answers`);
        }

        router.push(`/student/result/${docRef.id}?score=${score}&total=${quiz.questions.length}`);
    } catch (error: any) {
        console.error("Error submitting quiz result: ", error);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: error.message || "Could not save your quiz results. Please try again.",
        });
        setIsSubmitting(false);
    }
  };
  
  const palette = (
        <Card>
            <CardHeader>
                <CardTitle>Questions</CardTitle>
            </CardHeader>
            <CardContent>
                <QuestionPalette
                    totalQuestions={quiz.questions.length}
                    answers={answers}
                    currentQuestionIndex={currentQuestionIndex}
                    onQuestionSelect={handleQuestionSelect}
                />
            </CardContent>
        </Card>
    );

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-8">
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="w-full max-w-2xl space-y-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
            </div>
            <Progress value={progress} className="w-full" />
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={(value) => handleOptionChange(currentQuestion.id, value)}
                        className="space-y-2"
                    >
                        {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2 rounded-md border p-4 has-[:checked]:border-primary has-[:checked]:bg-secondary">
                                <RadioGroupItem value={option} id={`${currentQuestion.id}-${index}`} />
                                <Label htmlFor={`${currentQuestion.id}-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                        Previous
                    </Button>
                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                                     <AlertDialogDescription>
                                        You have attempted {Object.keys(answers).length} out of {quiz.questions.length} questions. You cannot change your answers after submitting.
                                    </AlertDialogDescription>

                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleSubmit} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                        Confirm & Submit
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                        <Button onClick={handleNext}>
                            Next
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
      </div>
      <aside className="w-full md:w-64 md:pt-20">
          {isMobile ? (
               <Drawer>
                    <DrawerTrigger asChild>
                        <Button variant="outline" className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg md:hidden">
                            <PanelLeft className="h-6 w-6" />
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Questions</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-4">
                           {palette}
                        </div>
                    </DrawerContent>
                </Drawer>
          ) : (
            palette
          )}
        </aside>
    </div>
  );
}