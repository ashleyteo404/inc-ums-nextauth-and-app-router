import { Prisma, Role, TeamMember } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure
} from "~/server/api/trpc";
import { api } from "~/trpc/server";
import { teamMemberWithUserFk } from "~/types/types";

const teamMemberRouter = createTRPCRouter({
  getUserRole: protectedProcedure
    .input(
      z.object({
        teamId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const { teamId } = input;
      const userId = ctx.session.user.id;

      const userRole = await ctx.db.teamMember.findFirst({
        where: {
          userId: userId,
          teamId: teamId
        },
        select: {
          role: true
        }
      })
      if (!userRole) throw new TRPCError({ code: "NOT_FOUND", message: "User not found :(" });
      else return userRole.role;
    }),

  getTeamMembers: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const teamMembers: ({
        userFk: {
            id: string;
            name: string | null;
            email: string | null;
            emailVerified: Date | null;
            image: string | null;
            hashedPassword: string;
        };
    } & {
        teamMemberId: string;
        createdAt: Date;
        updatedAt: Date;
        role: Role;
        teamId: string;
        userId: string;
    })[] = await ctx.db.teamMember.findMany({
        where: { teamId: input.teamId },
        include: {
          userFk: true, // include the related user
        },
      });
  
      const matchingTeamMember = teamMembers.find(
        (teamMember: TeamMember) => teamMember.userId === input.userId
      );

      if (!matchingTeamMember) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You do not have access to this team >:(" });
      } else {
        const formattedTeamMembers = teamMembers.map((teamMember) => ({
          id: teamMember.userFk.id,
          name: teamMember.userFk.name,
          email: teamMember.userFk.email,
          image: teamMember.userFk.image,
          role: teamMember.role,
          teamMemberId: teamMember.teamMemberId,
          teamId: teamMember.teamId
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
      const { teamId, email } = input;

      const userRole: Role = await api.teamMember.getUserRole.query({ teamId: teamId });
      if (!userRole) throw new TRPCError({ code: "NOT_FOUND", message: "User not found :(" })
      if (userRole === "normal") throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorised, you do not have perms >:("});

      try {
        const memberId = await ctx.db.user.findFirst({
          where: {
            email: email
          },
          select: {
            id: true // include only the memberId in the result
          }
        })

        if(!memberId) throw new TRPCError({ code: "NOT_FOUND", message: "Member does not exist :(" });
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
        } else {
          throw new Error("Failed to add member to team :(");
        }
      }
    }),
  
  updateRole: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        teamMemberId: z.string(),
        role: z.nativeEnum(Role)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { teamId, teamMemberId, role } = input;

      const userRole: Role = await api.teamMember.getUserRole.query({ teamId: teamId });
      if (!userRole) throw new TRPCError({ code: "NOT_FOUND", message: "User not found :(" })
      if (userRole === "normal") throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorised, you do not have perms >:("});

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
        teamId: z.string(),
        teamMemberId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { teamId, teamMemberId } = input;

      const userRole: Role = await api.teamMember.getUserRole.query({ teamId: teamId });
      if (!userRole) throw new TRPCError({ code: "NOT_FOUND", message: "User not found :(" })
      if (userRole === "normal") throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorised, you do not have perms >:("});

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