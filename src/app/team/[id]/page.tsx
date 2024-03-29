import React from 'react'
import { api } from "~/trpc/server";
import { db } from '~/server/db';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/server/auth';

import { Separator } from '~/components/ui/separator';
import { toast } from 'sonner';

import type { teamMemberWithUserFk } from '~/types/types';
import TeamMembersTable from '~/components/team/members/TeamMembersTable';
import AddTeamMember from '~/components/team/members/AddTeamMember';
import LeaveTeamModal from '~/components/team/members/LeaveTeamModal';
import EditTeamModal from '~/components/team/EditTeamModal';
import DeleteTeamModal from '~/components/team/DeleteTeamModal';

type Props = {
  params: { id: string }
}

export default async function TeamMembers ({ params }: Props) {
  const team = await db.team.findFirst({where: {teamId: params.id}})
  if (!team) redirect("/");

  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  let teamMembers:teamMemberWithUserFk[] = [];
  teamMembers = await api.teamMember.getTeamMembers.query({ teamId: params.id, userId: session.user.id });

  const user = teamMembers.find(
    (member) => member.id === session.user.id
  );
  if (!user) {
    toast.error("Unauthorised access. You are not in this team!");
    redirect("/");
  }   

    return (
    <>
      <div>
        <div className="flex justify-between items-center m-4">
          <div className="flex items-center">
            <h1 className="font-bold text-4xl m-4">{team.name}</h1>
            {user.role !== "normal" && <EditTeamModal team={team} />}
          </div>
          <div className="flex items-center space-x-3">
            {user.role === "owner" && (<DeleteTeamModal teamId={team.teamId} />)}
            <LeaveTeamModal teamMemberId={user.teamMemberId} />
          </div>
        </div>
        <p className="text-xl m-4">{team.description}</p>
      </div>
      <div className="m-2">
        <Separator />
      </div>
      <h2 className="font-bold text-2xl m-4">{team.name}&apos;s Members</h2>
      {user.role !== "normal" && (<AddTeamMember teamId={team.teamId} />)}
      <TeamMembersTable team={team} members={teamMembers} />
    </>
  )
}
