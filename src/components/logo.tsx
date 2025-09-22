import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-primary', className)}>
      <BrainCircuit className="h-8 w-8" />
      <span className="text-2xl font-bold font-headline">QuizVerse</span>
    </div>
  );
}
