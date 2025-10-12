
'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, BarChart2 } from "lucide-react";
import { Logo } from "../logo";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Skeleton } from "../ui/skeleton";

export function StudentLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, userProfile, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/login');
            } else if (userProfile && userProfile.role !== 'student') {
                signOut(auth).then(() => {
                    router.replace('/login');
                });
            }
        }
    }, [user, userProfile, loading, router]);


    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };
    
    if (loading || !user || !userProfile) {
        return (
          <div className="flex h-screen items-center justify-center">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading...</span>
            </div>
          </div>
        );
    }


    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-card">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/student/dashboard">
                        <Logo className="hidden md:flex" />
                    </Link>
                     <div className="md:hidden">
                        <span className="font-bold">IEC Quiz</span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://i.pravatar.cc/150?u=${user?.uid}`} alt={userProfile?.name} />
                                    <AvatarFallback>{userProfile?.name?.[0] || 'S'}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                {loading ? (
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                ) : (
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{userProfile?.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                                )}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/student/dashboard')}>
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => router.push('/student/results')}>
                                <BarChart2 className="mr-2 h-4 w-4" />
                                <span>My Results</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="flex flex-1 flex-col container mx-auto px-4 py-8">
                {children}
            </main>
            <footer className="container mx-auto flex flex-col items-center justify-between gap-4 border-t py-4 text-center sm:flex-row">
                <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} IEC Group of Institutions. All rights reserved.
                </p>
                <p className="text-sm text-muted-foreground">
                    Made by <a href="https://www.linkedin.com/in/prakhar-doneria/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Prakhar Doneria</a>
                </p>
            </footer>
        </div>
    );
}
