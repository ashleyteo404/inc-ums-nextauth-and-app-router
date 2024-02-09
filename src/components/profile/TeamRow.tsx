import React from 'react'
import type { Team } from '@prisma/client';
import TeamRowDetails from './TeamRowDetails';
import Link from 'next/link';
import { Button } from '../ui/button';

type Props = {
    teams: Team[];
}

const TeamRow = ({ teams }: Props) => {
  return (
    <div className="space-y-8">
      {teams.map((team) => {
        return (
          <div key={team.teamId} className="flex items-center">
              <TeamRowDetails team={team} />
              <div className="flex ml-auto space-x-3" >
                <Link href={`/team/${team.teamId}`}>
                  <Button variant="default">
                    View Team
                  </Button>
                </Link>
              </div>
          </div>
        )
      })}
    </div>
  )
}

export default TeamRow