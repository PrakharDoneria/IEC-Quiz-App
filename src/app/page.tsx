import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="items-center text-center">
            <Logo />
            <CardTitle className="text-3xl font-bold tracking-tight text-primary">
              Welcome to QuizVerse
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your gateway to knowledge and competition.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Link href="/login" passHref>
              <Button variant="outline" className="w-full justify-between">
                Student Portal <ArrowRight />
              </Button>
            </Link>
            <Link href="/admin/login" passHref>
              <Button variant="outline" className="w-full justify-between">
                Admin Portal <ArrowRight />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} QuizVerse. All rights reserved.</p>
      </footer>
    </div>
  );
}
