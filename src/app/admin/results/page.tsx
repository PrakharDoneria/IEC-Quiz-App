'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Quiz, Result } from '@/lib/data';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function AdminResultsPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      try {
        const querySnapshot = await getDocs(collection(firestore, 'quizzes'));
        const quizzesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
        setQuizzes(quizzesData);
        if (quizzesData.length > 0) {
            setSelectedQuizId(quizzesData[0].id);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (!selectedQuizId) {
        setResults([]);
        setLoading(false);
        return;
    };

    const fetchResults = async () => {
      setLoading(true);
      try {
        const q = query(collection(firestore, 'results'), where('quizId', '==', selectedQuizId));
        const querySnapshot = await getDocs(q);
        const resultsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Result));
        setResults(resultsData);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [selectedQuizId]);

  const topStudents = useMemo(() => {
    if (!results) return [];
    
    const studentsBySchool: Record<string, Result[]> = {};
    results.forEach(result => {
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

  }, [results]);

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
            <Select onValueChange={setSelectedQuizId} value={selectedQuizId || ''} disabled={loadingQuizzes || quizzes.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={loadingQuizzes ? "Loading quizzes..." : "Select a quiz..."} />
              </SelectTrigger>
              <SelectContent>
                {quizzes.length > 0 ? (
                    quizzes.map(quiz => (
                    <SelectItem key={quiz.id} value={quiz.id}>{quiz.title} ({quiz.code})</SelectItem>
                    ))
                ) : (
                    <SelectItem value="no-quiz" disabled>No quizzes found</SelectItem>
                )}
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
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center">Loading results...</TableCell>
                    </TableRow>
                ) : topStudents.length > 0 ? (
                  topStudents.map((result) => (
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
