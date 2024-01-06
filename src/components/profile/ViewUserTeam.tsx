import React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"
import type { Team } from '@prisma/client';
import TeamRow from './TeamRow';
// import CreateTeamModal from './CreateTeamModal';

type Props = {
    teams: Team[];
}

export default function ViewUserTeam({ teams }: Props) {
  return (
    <>
        <Card>
            <CardHeader>
                <CardTitle className="flex">
                    <div className="flex" >
                        Teams
                    </div>
                    <div className="ml-auto">
                        {/* <CreateTeamModal /> */}
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