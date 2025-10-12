import Link from "next/link";
import { Logo } from "./logo";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
       <div className="pointer-events-none fixed left-0 top-0 z-[9999] h-32 w-32 overflow-hidden">
          <div className="absolute -left-12 top-8 w-48 rotate-[-45deg] bg-red-600 py-1 text-center text-xs font-bold uppercase text-white shadow-lg">
              Under Testing
          </div>
      </div>
      <header className="p-4">
        <Link href="/" aria-label="Go to homepage">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
