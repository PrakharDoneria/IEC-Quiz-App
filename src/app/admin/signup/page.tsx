
'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/auth-layout';
import { auth, firestore } from '@/lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }).refine(
    (email) => email.endsWith('@ieccollege.com'),
    { message: 'Only @ieccollege.com emails are allowed for admin registration.' }
  ),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function AdminSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const handleSignup = async (values: SignupFormValues) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        await sendEmailVerification(user);

        // For admins, we skip schoolName and mobile
        await setDoc(doc(firestore, 'users', user.uid), {
            uid: user.uid,
            name: values.name,
            email: values.email,
            role: 'admin',
            schoolName: 'IEC Admin', // Placeholder or could be omitted
            mobile: '', // Placeholder or could be omitted
        });

        toast({ title: 'Admin Account Created', description: 'Verification email sent! Please check your inbox.' });
        await auth.signOut();
        router.push('/admin/login');
    } catch (error: any) {
        console.error('Admin Signup Error:', error);
        toast({
            variant: 'destructive',
            title: 'Signup Failed',
            description: error.message || 'An unexpected error occurred.',
        });
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an Admin Account</CardTitle>
          <CardDescription>For authorized personnel with an @ieccollege.com email.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignup)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Admin Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@ieccollege.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} />
                        <Button 
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                          onClick={() => setShowPassword(prev => !prev)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating Account...' : 'Create Admin Account'}
                </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an admin account?{' '}
                <Link href="/admin/login" className="font-medium text-primary hover:underline">
                  Login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AuthLayout>
  );
}
