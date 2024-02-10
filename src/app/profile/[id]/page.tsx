import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import React from 'react'
import ViewUserTeam from '~/components/profile/ViewUserTeam';
import { authOptions } from '~/server/auth';
import { api } from "~/trpc/server";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar"

export default async function profile () {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signIn");
  
  const teams = await api.team.getUserTeam.query({ userId: session.user.id });

  return (
    <> 
      <div className="flex items-center">
        <Avatar className="h-40 w-40 m-10">
          <AvatarImage src={session.user.image ? session.user.image : ""} alt="Avatar" />
          <AvatarFallback>{session.user.name ? session.user.name.split(' ').map(word => word[0]).join('').toUpperCase() : ""}</AvatarFallback>
        </Avatar>
        <div>
          <p className="mb-3 text-4xl text-left font-medium leading-none">{session.user.name}</p>
          <p className="text-xl text-left text-muted-foreground">{session.user.email}</p>
        </div>
      </div>
      <ViewUserTeam userId={session.user.id} teams={teams} />
    </>
  )
}
