"use client"

import React from 'react'
import { api } from '~/trpc/react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { TRPCClientError } from '@trpc/client';

export default function TestProtectedProcedure() {
    const testProtectedProcedure = api.user.testProtectedProcedure.useMutation();

    const callTestProtectedProcedure = async () => {
        toast.promise(testProtectedProcedure.mutateAsync(), {
            loading: "Testing protected procedure...",
            success:  () => {
                return "Authorised as you are signed in :)";
            },
            error: (error) => { 
                if (error instanceof TRPCClientError) {
                    if (error.message === "UNAUTHORIZED") return "Unauthorised as you are not signed in >:(";
                    else return error.message;
                } else {
                    return "Failed to get user's team :(";
                }
            }
        })
    }
    
  return (
    <div className='flex flex-col text-m items-center space-y-2'>
        <div>
            <p className='text-center'>
                Test this call signed in and out!<br/>You should only be able to make a protected procedure call when you are signed in :)
            </p>
        </div>
        <Button variant={"link"} className="bg-[#300D4F] text-muted" onClick={async () => {await callTestProtectedProcedure()}}>
            Make a Protected Procedure call
        </Button>
    </div>
  )
}