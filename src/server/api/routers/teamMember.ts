import { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure
} from "~/server/api/trpc";

const teamMemberRouter = createTRPCRouter({
  getTeamMembers: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const teamMembers = await ctx.db.teamMember.findMany({
        where: { teamId: input.teamId },
        include: {
          userFk: true, // include the related user
        },
      });
  
      const matchingTeamMember = teamMembers.find(
        (teamMember) => teamMember.userId === input.userId
      );

      if (!matchingTeamMember) {
        throw new Error("User does not have access to this team");
      } else {
        const formattedTeamMembers = teamMembers.map((teamMember) => ({
          id: teamMember.userFk.id,
          name: teamMember.userFk.name,
          email: teamMember.userFk.email,
          image: teamMember.userFk.image,
          role: teamMember.role,
          teamMemberId: teamMember.teamMemberId
        }));
  
        return formattedTeamMembers;
      }
    }),

  addTeamMember: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        email: z.string().email()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const memberId = await ctx.db.user.findFirst({
          where: {
            email: input.email
          },
          select: {
            id: true // Include only the memberId in the result
          }
        })
        
        if(!memberId) throw new Error("Member does not exist");
        else {
          const teamMember = await ctx.db.teamMember.create({
            data: {
              role: "normal",
              teamId: input.teamId,
              userId: memberId.id
            }
          });
          return { id: teamMember.teamMemberId };  
        }
      } catch (error) {
        // P2002 is the error code a unique constraint violation
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new Error("Member is already in team :(");
        } else {
          throw new Error("Failed to add member to team :(");
        }
      }
    }),
  
  removeTeamMember: protectedProcedure
    .input(
      z.object({
        teamMemberId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const removedTeamMember = await ctx.db.teamMember.delete({
          where: { 
            teamMemberId: input.teamMemberId
          }
        });
        if (!removedTeamMember) {
          throw new Error("Team member not found :(");
        }
        return { success: true };
      } catch (error) {
        throw new Error("Failed to remove member from team :(");
      }
    }),
});

export default teamMemberRouter