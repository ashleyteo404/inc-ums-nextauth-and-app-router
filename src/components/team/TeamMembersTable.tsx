import React from 'react'
import type { Team } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import type { teamMemberWithUserFk } from '~/types/types';
// import RemoveTeamMemberModal from './RemoveTeamMemberModal';

type Props = {
  team: Team;
  members: teamMemberWithUserFk[];
}

export default function TeamMembersTable ({ team, members }: Props) {
  return (
    <div className="m-4">
      <Table>
        <TableCaption>{team.name}&apos;s Members</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            {/* <TableHead>Action</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member, index) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{index+1}</TableCell>
              <TableCell>{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase()}</TableCell>
              {/* <TableCell><RemoveTeamMemberModal teamMemberId={member.teamMemberId} /></TableCell> */}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total Members</TableCell>
            <TableCell className="text-right">{members.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

