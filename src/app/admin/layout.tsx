
'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, Upload, BarChart2, FileOutput, LogOut, PanelLeft, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/upload', label: 'Upload Quiz', icon: Upload },
  { href: '/admin/quizzes', label: 'Manage Quizzes', icon: ClipboardList },
  { href: '/admin/results', label: 'Results', icon: BarChart2 },
  { href: '/admin/export', label: 'Export Data', icon: FileOutput },
];

function NavContent({ isLoading, onLinkClick }: { isLoading: boolean; onLinkClick?: () => void }) {
    const pathname = usePathname();

    if (isLoading) {
        return (
            <>
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
            </>
        );
    }

    return (
        <>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href} onClick={onLinkClick}>
                    <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label }}
                    >
                    <item.icon />
                    <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
        </>
    )
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/admin/login');
      return;
    }
    if (!loading && user && !user.email?.endsWith('@ieccollege.com')) {
      signOut(auth);
      router.replace('/admin/login');
    }
  }, [user, loading, router]);


  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };
  
  if (pathname === '/admin/login' || pathname === '/admin/signup') {
    return <>{children}</>;
  }

  // Show a full-page loader until auth state is determined
  if (loading) {
     return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Authenticating...</span>
        </div>
      </div>
    );
  }
  
  // If not loading and no user, we will redirect, but can return null to avoid flash
  if (!user) {
    return null;
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <NavContent isLoading={loading} />
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className='items-center'>
           <div className='flex items-center gap-2 w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors'>
                <Avatar className="h-8 w-8">
                    <AvatarFallback>{userProfile?.name?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col text-left group-data-[collapsible=icon]:hidden'>
                    {loading ? (
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    ) : (
                        <>
                        <span className='text-sm font-semibold text-sidebar-foreground'>{userProfile?.name || 'Admin'}</span>
                        <span className='text-xs text-muted-foreground'>{user?.email}</span>
                        </>
                    )}
                </div>
            </div>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="pointer-events-none fixed left-0 top-0 z-[9999] h-32 w-32 overflow-hidden">
            <div className="absolute -left-12 top-8 w-48 rotate-[-45deg] bg-red-600 py-1 text-center text-xs font-bold uppercase text-white shadow-lg">
                Under Testing
            </div>
        </div>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground border-sidebar-border flex flex-col p-0">
                     <SidebarHeader className='!p-0 !px-2.5'>
                        <SheetHeader>
                          <SheetTitle><Logo /></SheetTitle>
                          <SheetDescription className='sr-only'>Admin Menu</SheetDescription>
                        </SheetHeader>
                    </SidebarHeader>
                     <SidebarContent className='!p-0 !px-2.5 mt-4'>
                        <SidebarMenu>
                            <NavContent isLoading={loading} onLinkClick={() => setMobileSheetOpen(false)} />
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter className='!p-0 !px-2.5 mt-auto'>
                         <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => {
                            setMobileSheetOpen(false);
                            handleLogout();
                         }}>
                            <LogOut />
                            <span>Logout</span>
                        </Button>
                    </SidebarFooter>
                </SheetContent>
            </Sheet>
             <h1 className="font-semibold text-lg">IEC Quiz Admin</h1>
        </header>
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
            <div className='flex-1'>
                {children}
            </div>
            <footer className="mt-8 pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground">
                    Made by <a href="https://www.linkedin.com/in/prakhar-doneria/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Prakhar Doneria</a>
                </p>
            </footer>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
