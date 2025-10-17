
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { StudentLayout } from '@/components/student/student-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { firestore } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  schoolName: z.string().min(3, { message: 'School name is required.' }),
  boardRollNumber: z.string().min(5, { message: '10th board roll number is required.' }),
  mobile: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit mobile number.' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: userProfile?.name || '',
      schoolName: userProfile?.schoolName || '',
      boardRollNumber: userProfile?.boardRollNumber || '',
      mobile: userProfile?.mobile || '',
    },
  });

  const handleEditToggle = () => {
    if (isEditing) {
      form.reset({
        name: userProfile?.name || '',
        schoolName: userProfile?.schoolName || '',
        boardRollNumber: userProfile?.boardRollNumber || '',
        mobile: userProfile?.mobile || '',
      }); // Reset form if canceling edit
    }
    setIsEditing(!isEditing);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    try {
      await updateDoc(doc(firestore, 'users', user.uid), data);
      toast({ title: 'Success', description: 'Your profile has been updated.' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update your profile.' });
    }
  };
  
  if (loading) {
    return (
        <StudentLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">My Profile</h1>
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>View and update your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                 <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={userProfile?.email || ''} disabled className="bg-muted/50" />
                </div>
                <div />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="boardRollNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>10th Board Roll Number</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={handleEditToggle}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleEditToggle}>Edit Profile</Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </StudentLayout>
  );
}
