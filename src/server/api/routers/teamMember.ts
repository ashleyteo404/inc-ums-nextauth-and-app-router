import { Prisma, Role } from "@prisma/client";
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
        throw new Error("You do not have access to this team >:(");
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
        userRole: z.nativeEnum(Role),
        teamId: z.string(),
        email: z.string().email()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userRole, teamId, email } = input;

      if (userRole === "normal") throw new Error("Unauthorised, you do not have perms >:(");

      try {
        const memberId = await ctx.db.user.findFirst({
          where: {
            email: email
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
              teamId: teamId,
              userId: memberId.id
            }
          });
          return { id: teamMember.teamMemberId };  
        }
      } catch (error) {
        // P2002 is the error code a unique constraint violation
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new Error("Member is already in team :(");
        } else if (error === "Member does not exist") {
        throw new Error("Member does not exist");
        } else {
          throw new Error("Failed to add member to team :(");
        }
      }
    }),
  
  updateRole: protectedProcedure
    .input(
      z.object({
        userRole: z.nativeEnum(Role),
        teamMemberId: z.string(),
        role: z.nativeEnum(Role)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userRole, teamMemberId, role } = input;

      if (userRole === "normal") throw new Error("Unauthorised, you do not have perms >:(");

      try {
        const updatedTeamMember = await ctx.db.teamMember.update({
          where: { 
            teamMemberId: teamMemberId
          },
          data: {
            role: role
          }
        });
        if (!updatedTeamMember) {
          throw new Error("Team member not found :(");
        }
        return { success: true };
      } catch (error) {
        throw new Error("Failed to update admin status of member :(");
      }
    }),

  removeTeamMember: protectedProcedure
    .input(
      z.object({
        userRole: z.nativeEnum(Role),
        teamMemberId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userRole, teamMemberId } = input;

      if (userRole === "normal") throw new Error("Unauthorised, you do not have perms >:(");

      try {
        const removedTeamMember = await ctx.db.teamMember.delete({
          where: { 
            teamMemberId: teamMemberId
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

  leaveTeam: protectedProcedure
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

        // delete team if there are no remaining member
        const remainingTeamMembers = await ctx.db.teamMember.findMany({
          where: {
            teamId: removedTeamMember.teamId
          }
        })
        if (remainingTeamMembers.length === 0) {
          await ctx.db.team.delete({
            where: {
              teamId: removedTeamMember.teamId
            }
          })
        }
        return { success: true };
      } catch (error) {
        throw new Error("Failed to remove member from team :(");
      }
    }),
});

export default teamMemberRouter