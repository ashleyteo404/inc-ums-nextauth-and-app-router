"use client"

import React from 'react'
import { Input } from '~/components/ui/input'
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from '~/components/ui/form';
import { Button } from '~/components/ui/button';
import { z } from 'zod';
import { toast } from 'sonner';
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from '~/trpc/react';
import { TRPCClientError } from '@trpc/client';
import { useRouter } from 'next/navigation';

type Props = {
  teamId: string
}

const formSchema = z.object({
    memberEmail: z.string().email(),
})
  
export default function AddTeamMember({ teamId }: Props) {
  const router = useRouter();

  const addTeamMember = api.teamMember.addTeamMember.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberEmail: "",
    },
  })

  const onSubmit = async () => {
    const memberEmail = form.getValues().memberEmail;
    const data = {
      email: memberEmail
    }

    toast.promise(addTeamMember.mutateAsync({ teamId: teamId, ...data}), {
        loading: "Adding member...",
        success: () => {
          // Reload the page upon successful submission
          form.reset();
          router.refresh();
          return "Member added :)";
        },
        error: (error) => { 
          if (error instanceof TRPCClientError) {
            return error.message;
          } else {
            return "Failed to add member to team :(";
          }
        }
    })
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center m-4">
            <Button type="submit" className="ml-auto">Add Member</Button>
            <FormField
                control={form.control}
                name="memberEmail"
                render={({ field }) => (
                    <FormItem className="flex-grow ml-4">
                    {/* <FormLabel>Username</FormLabel> */}
                    <FormControl>
                        <Input placeholder="Add Member by Email" {...field} />
                    </FormControl>
                    {/* <FormDescription>This is your public display name.</FormDescription> */}
                    <FormMessage />
                    </FormItem>
                )}
            />
        </form>
    </Form>
  )
}