import type { Role, Team, TeamMember } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { api } from "~/trpc/server";

const teamRouter = createTRPCRouter({
  getUserTeam: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const memberOf = await ctx.db.teamMember.findMany({
        where: {
          userId: input.userId
        }
      })

      const teams: Team[] = await Promise.all(
        memberOf.map(async (currentTeam: TeamMember) => {
          const team = await ctx.db.team.findFirst({
            where: {
              teamId: currentTeam.teamId
            }
          })
          if (!team) throw new TRPCError({ code: "NOT_FOUND", message: `Team not found :(\nteamId: ${currentTeam.teamId}` });
          else return team;
        })
      )

      return teams;
    }),

  createTeam: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string().min(1) ,
        description: z.string().nullable()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { userId, name, description } = input;

        await ctx.db.$transaction(async () => {
          const team = await ctx.db.team.create({
            data: {
              createdBy: userId,
              name: name,
              description: description?.trim() !== "" ? description : null
            }
          });

          return ctx.db.teamMember.create({
            data: {
              role: "owner",
              teamId: team.teamId,
              userId: userId
            }
          })
        })

        return;  
      } catch (error) {
        throw new Error("Failed to create team :(");
      }
    }),

  updateTeam: protectedProcedure
    .input(
      z.object({ 
        teamId: z.string(),
        name: z.string().min(1),
        description: z.string().nullable()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { teamId, name, description } = input;

      const userRole: Role = await api.teamMember.getUserRole.query({ teamId: teamId });
      if (!userRole) throw new TRPCError({ code: "NOT_FOUND", message: "User not found :(" })
      if (userRole === "normal") throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorised, you do not have perms >:("});

      try {
        const team = await ctx.db.team.update({
          where: { teamId: teamId },
          data: {
            name: name,
            description: description?.trim() !== "" ? description : null
          }
        });
        return { id: team.teamId };
      } catch (error) {
        throw new Error("Failed to update team :(");
      }
    }),
  
  deleteTeam: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { teamId } = input;

      const userRole: Role = await api.teamMember.getUserRole.query({ teamId: teamId });
      if (!userRole) throw new TRPCError({ code: "NOT_FOUND", message: "User not found :(" })
      if (userRole !== "owner") throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorised, you do not have perms >:("});

      try {
        await ctx.db.$transaction([
          ctx.db.teamMember.deleteMany({
            where: {
              teamId: teamId,
            },
          }),
          ctx.db.team.delete({
            where: { teamId: teamId },
          }),
        ]);
  
        return;
      } catch (error) {
        throw new Error("Failed to delete team :(");
      }
    }),

});

export default teamRouter