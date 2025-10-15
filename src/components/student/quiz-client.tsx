
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { PanelLeft, Clock, HelpCircle, Send } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


type Answers = Record<string, string>;

interface QuizClientProps {
    quiz: Quiz;
    questionNumber: number;
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

function QuestionPalette({
    quiz,
    totalQuestions,
    answers,
    currentQuestionIndex,
    onQuestionSelect,
}: {
    quiz: Quiz;
    totalQuestions: number;
    answers: Answers;
    currentQuestionIndex: number;
    onQuestionSelect: (qNumber: number) => void;
}) {
    return (
        <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Array.from({ length: totalQuestions }).map((_, i) => {
                const questionId = quiz.questions[i].id;
                const isAttempted = answers.hasOwnProperty(questionId);
                const isCurrent = i === currentQuestionIndex;

                return (
                    <Button
                        key={i}
                        variant={isCurrent ? "default" : isAttempted ? 'secondary' : 'outline'}
                        className={cn(
                            "h-10 w-10 p-0",
                             isCurrent && "ring-2 ring-primary-foreground ring-offset-2 ring-offset-primary",
                             isAttempted && !isCurrent ? 'bg-green-600 hover:bg-green-700 text-white': ''
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitHasBeenCalled = useRef(false);
  const [warnings, setWarnings] = useState(0);
  const MAX_WARNINGS = 3;
  
  const [answers, setAnswers] = useState<Answers>(() => {
    if (typeof window !== 'undefined') {
        const savedAnswers = sessionStorage.getItem(`quiz-${quiz.id}-answers`);
        return savedAnswers ? JSON.parse(savedAnswers) : {};
    }
    return {};
  });

  const [timeLeft, setTimeLeft] = useState(quiz.duration);
  const [timeUpAlertOpen, setTimeUpAlertOpen] = useState(false);
  
  const currentQuestionIndex = questionNumber - 1;
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(`quiz-${quiz.id}-answers`, JSON.stringify(answers));
    }
  }, [answers, quiz.id]);

  useEffect(() => {
    const endTimeKey = `quiz-${quiz.id}-endTime`;
    let storedEndTime = sessionStorage.getItem(endTimeKey);
    let endTime: number;

    if (storedEndTime) {
        endTime = parseInt(storedEndTime, 10);
    } else {
        endTime = Date.now() + quiz.duration * 1000;
        sessionStorage.setItem(endTimeKey, endTime.toString());
    }

    const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(remaining);

        if (remaining === 0) {
            clearInterval(timer);
            if (!submitHasBeenCalled.current) {
                setTimeUpAlertOpen(true);
            }
        }
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz.id, quiz.duration]);


  useEffect(() => {
    if (timeUpAlertOpen && !submitHasBeenCalled.current) {
      handleSubmit(true); // true indicates auto-submission
    }
  }, [timeUpAlertOpen]);

  const handleCheatingAttempt = (e: Event) => {
    e.preventDefault();
    const newWarningCount = warnings + 1;
    setWarnings(newWarningCount);

    if (newWarningCount >= MAX_WARNINGS) {
        toast({
            variant: 'destructive',
            title: `Final Warning: Quiz Canceled`,
            description: `You have exceeded the maximum number of warnings. Your quiz will be submitted as is.`,
        });
        handleSubmit(true);
    } else {
        toast({
            variant: 'destructive',
            title: `Warning ${newWarningCount} of ${MAX_WARNINGS}`,
            description: 'This activity is prohibited during the quiz. Continuing will result in cancellation.',
        });
    }
};

useEffect(() => {
    const handleContextmenu = (e: MouseEvent) => handleCheatingAttempt(e);
    const handleCopy = (e: ClipboardEvent) => handleCheatingAttempt(e);
    const handleKeydown = (e: KeyboardEvent) => {
        // Block Ctrl+C, Ctrl+X, Ctrl+V
        if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v'].includes(e.key.toLowerCase())) {
            handleCheatingAttempt(e);
        }
        // Block Tab key
        if (e.key === 'Tab') {
            handleCheatingAttempt(e);
        }
    };
    
    document.addEventListener('contextmenu', handleContextmenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeydown);
    
    return () => {
        document.removeEventListener('contextmenu', handleContextmenu);
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('keydown', handleKeydown);
    };
}, [warnings]);


  if (currentQuestionIndex < 0 || currentQuestionIndex >= quiz.questions.length) {
    return notFound();
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = (Object.keys(answers).length / quiz.questions.length) * 100;

  const handleOptionChange = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
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
  
  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitHasBeenCalled.current) return;
    submitHasBeenCalled.current = true;
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
            answers: answers,
            warnings: isAutoSubmit ? warnings + 1 : warnings,
        };

        const docRef = await addDoc(collection(firestore, "results"), resultData);
        
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(`quiz-${quiz.id}-answers`);
            sessionStorage.removeItem(`quiz-${quiz.id}-endTime`);
        }
        
        if (isAutoSubmit && !timeUpAlertOpen) {
            // This case handles auto-submit from cheating, not timeout
        } else if (isAutoSubmit) {
            toast({
                title: "Time's Up!",
                description: "Your quiz has been automatically submitted."
            });
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
        submitHasBeenCalled.current = false;
    }
  };

  const FinalSubmitButton = ({ isDrawer = false }) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button 
              className={cn("w-full bg-accent hover:bg-accent/90 text-accent-foreground", isDrawer && "mt-4")} 
              disabled={isSubmitting}
            >
                <Send className="mr-2 h-4 w-4" />
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
                <AlertDialogAction onClick={() => handleSubmit(false)} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );

  
  const controlPanel = (
    <div className="flex flex-col h-full space-y-6">
        <div>
            <h2 className="text-xl font-bold mb-2">{quiz.title}</h2>
            <div className='flex items-center justify-center gap-2 font-mono text-3xl font-semibold text-destructive p-3 bg-destructive/10 rounded-lg'>
                <Clock className='h-8 w-8'/>
                <span>{formatTime(timeLeft)}</span>
            </div>
        </div>

        <Card>
            <CardHeader className="p-4">
                <CardTitle className="flex items-center justify-between text-lg">
                    <span>Progress</span>
                    <span className="text-base font-medium text-muted-foreground">{Object.keys(answers).length} / {quiz.questions.length}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Progress value={progress} />
            </CardContent>
        </Card>

        <FinalSubmitButton />

        <Card className="flex-1 overflow-y-auto">
            <CardHeader className="p-4">
                <CardTitle className="text-lg">Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <QuestionPalette
                    quiz={quiz}
                    totalQuestions={quiz.questions.length}
                    answers={answers}
                    currentQuestionIndex={currentQuestionIndex}
                    onQuestionSelect={handleQuestionSelect}
                />
            </CardContent>
        </Card>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-8">
      <AlertDialog open={timeUpAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Time is Up!</AlertDialogTitle>
                  <AlertDialogDescription>
                      Your time for this quiz has expired. Your answers will now be submitted automatically.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                   <Button disabled>Submitting...</Button>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      
      <div className="flex-1 flex flex-col justify-center items-center py-6">
        <div className="w-full max-w-2xl space-y-4">
            <Card className="shadow-lg animate-in fade-in">
                <CardHeader>
                    <p className="text-sm text-muted-foreground mb-2">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                    <CardTitle className="text-xl md:text-2xl">{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={(value) => handleOptionChange(currentQuestion.id, value)}
                        className="space-y-3"
                    >
                        {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-3 rounded-lg border p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:shadow-sm">
                                <RadioGroupItem value={option} id={`${currentQuestion.id}-${index}`} />
                                <Label htmlFor={`${currentQuestion.id}-${index}`} className="flex-1 cursor-pointer text-base">{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>
            <div className="flex justify-between mt-6">
                <Button variant="outline" size="lg" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                    Previous
                </Button>
                {currentQuestionIndex < quiz.questions.length - 1 && (
                     <Button size="lg" onClick={handleNext}>
                        Next
                    </Button>
                )}
            </div>
        </div>
      </div>

      <aside className="w-full md:w-80 lg:w-96 p-4 bg-muted/30 md:border-l md:py-6">
          {isMobile ? (
               <Drawer>
                    <DrawerTrigger asChild>
                        <Button variant="outline" className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg md:hidden">
                            <PanelLeft className="h-6 w-6" />
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Quiz Controls</DrawerTitle>
                            <DrawerDescription>Navigate questions and track your time.</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 overflow-y-auto">
                           {controlPanel}
                        </div>
                    </DrawerContent>
                </Drawer>
          ) : (
            <div className="sticky top-20 h-[calc(100vh-6rem)]">
                {controlPanel}
            </div>
          )}
        </aside>
    </div>
  );
}
