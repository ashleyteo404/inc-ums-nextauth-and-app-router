"use client"

import React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"
import type { Team } from '@prisma/client';
import TeamRow from './TeamRow';
import CreateTeamModal from './CreateTeamModal';
import { redirect, usePathname } from 'next/navigation'

type Props = {
    userId: string;
    teams: Team[];
}

const ViewUserTeam = ({ userId, teams }: Props) => {
    // redirect user to home page if the userId of the profile page 
    // does not match the userId of the session 
    // a.k.a the userId of the user who is currently signed in
    const pathname = usePathname(); // can only be used in client components (https://nextjs.org/docs/app/api-reference/functions/use-pathname)
    if (pathname !== `/profile/${userId}`) {
        redirect("/")
    }

  return (
    <>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <div className="flex" >
                        Teams
                    </div>
                    <div className="ml-2">
                        <CreateTeamModal userId={userId} />
                    </div>
                </CardTitle>
            </CardHeader>
            {teams.length < 1 && (
                <div className="flex items-center justify-center">
                    <p className="mb-2 text-l text-left text-muted-foreground">Not currently in any teams</p>
                </div>
            )}
            {teams.length > 0 && (
                <CardContent>
                    <TeamRow teams={teams} />
                </CardContent>
            )}
        </Card>
    </>
  )
}

export default ViewUserTeam