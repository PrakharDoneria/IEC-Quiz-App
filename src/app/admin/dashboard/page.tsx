
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Target, Activity } from "lucide-react";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
    totalQuizzes: number;
    totalStudents: number;
    averageScore: number;
}

interface RecentResult {
    id: string;
    studentName: string;
    quizTitle: string;
    score: number;
    total: number;
    createdAt: any;
}


export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch quizzes
                const quizzesSnapshot = await getDocs(collection(firestore, 'quizzes'));
                const totalQuizzes = quizzesSnapshot.size;

                // Fetch students
                const studentsQuery = query(collection(firestore, 'users'), where('role', '==', 'student'));
                const studentsSnapshot = await getDocs(studentsQuery);
                const totalStudents = studentsSnapshot.size;

                // Fetch results for average score and recent activity
                const resultsSnapshot = await getDocs(collection(firestore, 'results'));
                let totalScore = 0;
                let totalPossibleScore = 0;
                resultsSnapshot.forEach(doc => {
                    totalScore += doc.data().score;
                    totalPossibleScore += doc.data().total;
                });
                const averageScore = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;
                
                setStats({
                    totalQuizzes,
                    totalStudents,
                    averageScore,
                });
                
                // Fetch recent results
                const recentResultsQuery = query(collection(firestore, 'results'), orderBy('createdAt', 'desc'), limit(5));
                const recentResultsSnapshot = await getDocs(recentResultsQuery);
                
                const quizzesData: {[id: string]: string} = {};
                quizzesSnapshot.docs.forEach(doc => {
                    quizzesData[doc.id] = doc.data().title;
                });

                const recentResultsData = recentResultsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        studentName: data.studentName,
                        quizTitle: quizzesData[data.quizId] || 'Unknown Quiz',
                        score: data.score,
                        total: data.total,
                        createdAt: data.createdAt?.toDate(),
                    };
                });
                setRecentResults(recentResultsData);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }
  }, [user]);

  if (authLoading || loading || !user) {
    return (
      <div className="space-y-8">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Admin! Here&apos;s an overview of your QuizVerse.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24 mt-1" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24 mt-1" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24 mt-1" />
                </CardContent>
            </Card>
        </div>
         <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-32 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }
  
  const statCards = [
    { title: "Total Quizzes", value: stats?.totalQuizzes, icon: FileText },
    { title: "Total Students", value: stats?.totalStudents, icon: Users },
    { title: "Average Score", value: `${stats?.averageScore.toFixed(0)}%`, icon: Target },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin! Here&apos;s an overview of your QuizVerse.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
            {recentResults.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Quiz</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="text-right">Submitted</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentResults.map((result) => (
                        <TableRow key={result.id}>
                            <TableCell className="font-medium">{result.studentName}</TableCell>
                            <TableCell>{result.quizTitle}</TableCell>
                            <TableCell className="text-right">{result.score}/{result.total}</TableCell>
                             <TableCell className="text-right">{result.createdAt ? formatDistanceToNow(result.createdAt, { addSuffix: true }) : 'N/A'}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                 <p className="text-muted-foreground">No recent activity to display.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

    