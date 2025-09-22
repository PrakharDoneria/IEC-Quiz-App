'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import { Logo } from "../logo";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Skeleton } from "../ui/skeleton";

export function StudentLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, userProfile, loading } = useAuth();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };
    
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-card">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/student/dashboard">
                        <Logo className="hidden md:flex" />
                    </Link>
                     <div className="md:hidden">
                        <span className="font-bold">QuizVerse</span>
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
        </div>
    );
}
