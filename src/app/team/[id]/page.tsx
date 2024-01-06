import React from 'react'
import type { Team, User } from '@prisma/client';
import { api } from '~/trpc/server';
import { db } from '~/server/db';
import { redirect } from 'next/navigation';
import type { teamMemberWithUserFk } from '~/types/types';
import TeamMembersTable from '~/components/team/TeamMembersTable';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/server/auth';
import { toast } from 'sonner';
import { TRPCClientError } from '@trpc/client';
// import AddTeamMember from '~/components/team/teamMembers/AddTeamMember';
// import type { MemberWithTeamMemberId } from '~/types/types';

type Props = {
  params: { id: string }
}

export default async function TeamMembers ({ params }: Props) {
    const team = await db.team.findFirst({where: {teamId: params.id}})
    if (!team) redirect("/");

    const session = await getServerSession(authOptions);
    if (!session) redirect("/api/auth/signin");

    let teamMembers:teamMemberWithUserFk[] = [];
    try {
        teamMembers = await api.teamMember.getTeamMembers.query({ teamId: params.id, userId: session.user.id });
    } catch (err) {
        if (err instanceof TRPCClientError) {
            toast.error(err.message);
            return;
        }
    }

    return (
    <>
      <div>
        <h1 className="font-bold text-4xl m-4">{team.name}&apos;s Members</h1>
      </div>
      {/* <AddTeamMember teamId={team.teamId} /> */}
      <TeamMembersTable team={team} members={teamMembers} />
    </>
  )
}
