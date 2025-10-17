
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UpdateRollNumberDialogProps {
  open: boolean;
  onSave: (rollNumber: string) => Promise<void>;
}

const rollNumberSchema = z.object({
  rollNumber: z.string().min(5, { message: 'Roll number must be at least 5 characters.' }),
});

type RollNumberFormValues = z.infer<typeof rollNumberSchema>;

export function UpdateRollNumberDialog({ open, onSave }: UpdateRollNumberDialogProps) {
  const form = useForm<RollNumberFormValues>({
    resolver: zodResolver(rollNumberSchema),
    defaultValues: {
      rollNumber: '',
    },
  });

  const onSubmit = async (data: RollNumberFormValues) => {
    await onSave(data.rollNumber);
    form.reset();
  };

  return (
    <Dialog open={open}>
      <DialogContent hideCloseButton>
        <DialogHeader>
          <DialogTitle>Update Your Profile</DialogTitle>
          <DialogDescription>
            Please provide your 10th board roll number to continue. This is a one-time requirement.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rollNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>10th Board Roll Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your roll number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save and Continue'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
