'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Quiz, Question } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type Answers = Record<string, string>;

export function QuizClient({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleOptionChange = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleSubmit = () => {
    let score = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    // In a real app, you would save this to the backend.
    // For this demo, we'll pass it via query params.
    router.push(`/student/result/${quiz.code}?score=${score}&total=${quiz.questions.length}`);
  };


  return (
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
                            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Submit Quiz</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You cannot change your answers after submitting. Your result will be calculated based on your current selections.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogAction onClick={handleSubmit} className="bg-accent hover:bg-accent/90 text-accent-foreground">Confirm & Submit</AlertDialogAction>
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
  );
}
