import React from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "~/components/ui/avatar"
import type { Team } from '@prisma/client';
import { format } from 'date-fns';

type Props = {
    team: Team;
}

const TeamRowDetails = ({ team }: Props) => {
  return (
    <>
        <div className="flex items-center justify-items-start">
            <Avatar className="h-9 w-9">
            <AvatarImage src="" alt="Avatar" />
            <AvatarFallback>{team.name.split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
                <p className="text-sm text-left font-medium leading-none">{team.name}</p>
                <p className="text-sm text-left text-muted-foreground">{team.description}</p>
                <p className="text-sm text-muted-foreground">
                    Last updated at {format(new Date(team.updatedAt), 'dd-MM-yyyy HH:mm:ss')}
                </p>
            </div>
        </div>
    </>
  )
}

export default TeamRowDetails