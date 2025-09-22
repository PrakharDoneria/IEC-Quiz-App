
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Users, BarChart2 } from 'lucide-react';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Quiz, Result, UserProfile } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ExportPage() {
    const { toast } = useToast();
    const [isExportingStudents, setIsExportingStudents] = useState(false);
    const [isExportingResults, setIsExportingResults] = useState(false);
    
    // State for quiz results export
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [results, setResults] = useState<Result[]>([]);
    const [schools, setSchools] = useState<string[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            setLoadingQuizzes(true);
            try {
                const querySnapshot = await getDocs(collection(firestore, 'quizzes'));
                const quizzesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
                setQuizzes(quizzesData);
            } catch (error) {
                console.error("Error fetching quizzes:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch quizzes.' });
            } finally {
                setLoadingQuizzes(false);
            }
        };
        fetchQuizzes();
    }, [toast]);

    useEffect(() => {
        if (!selectedQuizId) {
            setResults([]);
            setSchools([]);
            setSelectedSchool(null);
            return;
        }

        const fetchResults = async () => {
            try {
                const q = query(collection(firestore, 'results'), where('quizId', '==', selectedQuizId));
                const querySnapshot = await getDocs(q);
                const resultsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Result));
                setResults(resultsData);
                
                const uniqueSchools = [...new Set(resultsData.map(r => r.schoolName))];
                setSchools(uniqueSchools);
            } catch (error) {
                console.error("Error fetching results:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch results for the selected quiz.' });
            }
        };
        fetchResults();
    }, [selectedQuizId, toast]);

    const handleExportStudents = async () => {
        setIsExportingStudents(true);
        try {
            const usersQuery = query(collection(firestore, 'users'), where('role', '==', 'student'));
            const querySnapshot = await getDocs(usersQuery);
            const students = querySnapshot.docs.map(doc => doc.data() as UserProfile);

            if (students.length === 0) {
                toast({ title: 'No Data', description: 'There are no students to export.' });
                return;
            }

            const dataToExport = students.map(({ name, schoolName, email, mobile }) => ({
                'Name': name,
                'School': schoolName,
                'Email': email,
                'Mobile': mobile,
            }));

            const XLSX = await import('xlsx');
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'All Students');
            XLSX.writeFile(wb, 'all_students.xlsx');
            
            toast({ title: 'Success', description: 'Student data exported.' });

        } catch (error) {
            console.error('Error exporting students:', error);
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not export student data.' });
        } finally {
            setIsExportingStudents(false);
        }
    };
    
    const handleExportResults = async () => {
        if (!selectedQuizId) {
            toast({ variant: 'destructive', title: 'No Quiz Selected', description: 'Please select a quiz to export results.' });
            return;
        }
        setIsExportingResults(true);

        try {
            let filteredResults = results;
            if (selectedSchool && selectedSchool !== 'all') {
                filteredResults = results.filter(r => r.schoolName === selectedSchool);
            }

            if (filteredResults.length === 0) {
                toast({ title: 'No Data', description: 'No results found for the selected filters.' });
                return;
            }

             const dataToExport = filteredResults.map(({ studentName, schoolName, score, total }) => ({
                'Student Name': studentName,
                'School Name': schoolName,
                'Score': score,
                'Total Marks': total,
                'Percentage': total > 0 ? ((score / total) * 100).toFixed(2) + '%' : '0%',
            }));
            
            const XLSX = await import('xlsx');
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            const quiz = quizzes.find(q => q.id === selectedQuizId);
            const sheetName = `${quiz?.code || 'Results'}`.slice(0, 31); // Sheet names have a 31-char limit
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            XLSX.writeFile(wb, `quiz_results_${quiz?.code || 'export'}.xlsx`);

            toast({ title: 'Success', description: 'Filtered quiz results exported.' });
            
        } catch (error) {
             console.error('Error exporting results:', error);
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not export quiz results.' });
        } finally {
            setIsExportingResults(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
                <p className="text-muted-foreground">
                    Generate and download student and quiz data reports.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Export All Students</CardTitle>
                                <CardDescription>
                                    Download a complete list of all registered students.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleExportStudents} disabled={isExportingStudents} className="w-full">
                            <FileDown className="mr-2 h-4 w-4" />
                            {isExportingStudents ? 'Exporting...' : 'Export All Students (.xlsx)'}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                         <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                                <BarChart2 className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <CardTitle>Export Quiz Results</CardTitle>
                                <CardDescription>
                                    Filter and download quiz submission results.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        
                        <Select onValueChange={setSelectedSchool} value={selectedSchool || 'all'} disabled={!selectedQuizId || schools.length === 0}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a school (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Schools</SelectItem>
                                {schools.map(school => (
                                    <SelectItem key={school} value={school}>{school}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button onClick={handleExportResults} disabled={isExportingResults || !selectedQuizId} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                            <FileDown className="mr-2 h-4 w-4" />
                            {isExportingResults ? 'Exporting...' : 'Export Filtered Results (.xlsx)'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    