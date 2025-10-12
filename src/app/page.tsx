
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';
import Image from 'next/image';

export default function Home() {

  return (
    <div className="flex min-h-screen flex-col bg-background">
       <div className="pointer-events-none fixed left-0 top-0 z-[9999] h-32 w-32 overflow-hidden">
          <div className="absolute -left-12 top-8 w-48 rotate-[-45deg] bg-red-600 py-1 text-center text-xs font-bold uppercase text-white shadow-lg">
              Under Testing
          </div>
      </div>
      <header className="container mx-auto flex h-20 items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-2">
           <Link href="/login" passHref>
            <Button variant="ghost">Student Login</Button>
          </Link>
          <Link href="/signup" passHref>
            <Button>Sign Up</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 py-16 md:grid-cols-2 lg:py-24">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Welcome to the <span className="text-primary">IEC Quiz</span> Platform
            </h1>
            <p className="text-lg text-muted-foreground">
              Your gateway to knowledge and competition. Engage in challenging quizzes, track your progress, and compete with peers.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
              <Link href="/login" passHref>
                <Button size="lg" className="w-full justify-between sm:w-auto">
                  Student Portal <ArrowRight />
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <Image 
              src="/home.jpg"
              alt="Students participating in an event at IEC Group of Institutions"
              width={600}
              height={400}
              className="rounded-lg shadow-xl"
            />
          </div>
        </section>
      </main>

      <footer className="container mx-auto flex flex-col items-center justify-between gap-4 border-t py-4 text-center sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} IEC Group of Institutions. All rights reserved.
        </p>
        <p className="text-sm text-muted-foreground">
            Made by <a href="https://www.linkedin.com/in/prakhar-doneria/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Prakhar Doneria</a>
        </p>
         <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-primary">
            Admin
        </Link>
      </footer>
    </div>
  );
}
