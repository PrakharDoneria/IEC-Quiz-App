'use client';

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
import { Home, Upload, BarChart2, FileOutput, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/upload', label: 'Upload Quiz', icon: Upload },
  { href: '/admin/results', label: 'Results', icon: BarChart2 },
  { href: '/admin/export', label: 'Export Data', icon: FileOutput },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'admin')) {
      router.replace('/admin/login');
    }
  }, [user, userProfile, loading, router]);


  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  if (loading || !user || userProfile?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
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
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className='items-center'>
           <div className='flex items-center gap-2 w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors'>
                <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${user?.uid}`} alt={userProfile?.name} />
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
                        <span className='text-sm font-semibold text-sidebar-foreground'>{userProfile?.name}</span>
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
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
