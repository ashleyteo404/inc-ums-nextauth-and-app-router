import React from 'react'
import type { Team } from '@prisma/client';
import TeamRowDetails from './TeamRowDetails';
// import EditTeamModal from './EditTeamModal';
// import DeleteTeamModal from './DeleteTeamModal';
import Link from 'next/link';
import { Button } from '../ui/button';

type Props = {
    teams: Team[];
}

export default function TeamRow({ teams }: Props) {
  return (
    <div className="space-y-8">
      {teams.map((team) => {
        return (
          <div key={team.teamId} className="flex items-center">
            <TeamRowDetails team={team} />
            {/* Team Name: {team.name} */}
            <div className="flex ml-auto space-x-3" >
              {/* <Link href={`/team/${team.teamId}`}>
                <Button variant="outline">
                  View Members
                </Button>
              </Link> */}
              {/* <EditTeamModal team={team} /> */}
              {/* <DeleteTeamModal teamId={team.teamId} /> */}
            </div>
          </div>
        )
      })}
    </div>
  )
}