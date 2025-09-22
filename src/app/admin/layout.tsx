
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
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, Upload, BarChart2, FileOutput, LogOut, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/upload', label: 'Upload Quiz', icon: Upload },
  { href: '/admin/results', label: 'Results', icon: BarChart2 },
  { href: '/admin/export', label: 'Export Data', icon: FileOutput },
];

function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
    const pathname = usePathname();
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


  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };
  
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <NavContent />
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className='items-center'>
           <div className='flex items-center gap-2 w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors'>
                <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile?.name ? `https://i.pravatar.cc/150?u=${user?.uid}` : undefined} alt={userProfile?.name || 'Admin'} />
                    <AvatarFallback>{userProfile?.name?.[0] || 'A'}</AvatarFallback>
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
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground border-sidebar-border">
                     <SidebarHeader className='!p-0 !px-2.5'>
                        <SheetHeader>
                          <SheetTitle><Logo /></SheetTitle>
                          <SheetDescription className='sr-only'>Admin Menu</SheetDescription>
                        </SheetHeader>
                    </SidebarHeader>
                     <SidebarContent className='!p-0 !px-2.5 mt-4'>
                        <SidebarMenu>
                            <NavContent onLinkClick={() => setMobileSheetOpen(false)} />
                        </SidebarMenu>
                    </SidebarContent>
                </SheetContent>
            </Sheet>
             <h1 className="font-semibold text-lg">IEC Quiz Admin</h1>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
