import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
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
              src="https://picsum.photos/600/400"
              alt="Students taking a quiz"
              width={600}
              height={400}
              className="rounded-lg shadow-xl"
              data-ai-hint="education learning"
            />
          </div>
        </section>
      </main>

      <footer className="container mx-auto flex flex-col items-center justify-between gap-2 border-t py-4 text-center sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} IEC Group of Institutions. All rights reserved.
        </p>
         <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-primary">
            Admin
        </Link>
      </footer>
    </div>
  );
}
