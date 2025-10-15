
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, orderBy } from 'firebase/firestore';
import type { Quiz } from '@/lib/data';
import { FilePlus, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function ManageQuizzesPage() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(query(collection(firestore, 'quizzes'), orderBy('title')));
                const quizzesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
                setQuizzes(quizzesData);
            } catch (error) {
                console.error("Error fetching quizzes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Quizzes</h1>
                    <p className="text-muted-foreground">View, edit, or update existing quizzes.</p>
                </div>
                 <Link href="/admin/upload" passHref>
                    <Button>
                        <FilePlus className="mr-2 h-4 w-4" />
                        Create New Quiz
                    </Button>
                </Link>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>All Quizzes</CardTitle>
                    <CardDescription>A list of all quizzes currently in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Questions</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : quizzes.length > 0 ? (
                                    quizzes.map((quiz) => (
                                        <TableRow key={quiz.id}>
                                            <TableCell className="font-medium">{quiz.title}</TableCell>
                                            <TableCell>{quiz.code}</TableCell>
                                            <TableCell>{quiz.questions?.length || 0}</TableCell>
                                            <TableCell>{quiz.duration ? `${quiz.duration / 60} mins` : 'N/A'}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.push(`/admin/quizzes/edit/${quiz.id}`)}>
                                                            Edit
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No quizzes found.
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
