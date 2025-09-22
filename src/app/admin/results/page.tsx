'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MOCK_QUIZZES, MOCK_RESULTS, Result } from '@/lib/data';

export default function AdminResultsPage() {
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(MOCK_QUIZZES[0]?.id || null);

  const topStudents = useMemo(() => {
    if (!selectedQuizId) return [];
    
    const resultsForQuiz = MOCK_RESULTS.filter(r => r.quizId === selectedQuizId);
    
    const studentsBySchool: Record<string, Result[]> = {};
    resultsForQuiz.forEach(result => {
      if (!studentsBySchool[result.schoolName]) {
        studentsBySchool[result.schoolName] = [];
      }
      studentsBySchool[result.schoolName].push(result);
    });

    const topStudentsData: Result[] = [];
    Object.values(studentsBySchool).forEach(schoolResults => {
      const sorted = schoolResults.sort((a, b) => b.score - a.score);
      topStudentsData.push(...sorted.slice(0, 3));
    });
    
    return topStudentsData.sort((a,b) => {
        if (a.schoolName < b.schoolName) return -1;
        if (a.schoolName > b.schoolName) return 1;
        return b.score - a.score;
    });

  }, [selectedQuizId]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quiz Results</h1>
        <p className="text-muted-foreground">View top performers for each quiz.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 3 Students per School</CardTitle>
          <CardDescription>Select a quiz to see the results.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs">
            <Select onValueChange={setSelectedQuizId} defaultValue={selectedQuizId || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select a quiz..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_QUIZZES.map(quiz => (
                  <SelectItem key={quiz.id} value={quiz.id}>{quiz.title} ({quiz.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStudents.length > 0 ? (
                  topStudents.map((result, index) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.schoolName}</TableCell>
                      <TableCell>{result.studentName}</TableCell>
                      <TableCell className="text-right">{result.score}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No results to display for this quiz.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
