import { Role } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

const teamRouter = createTRPCRouter({
  getUserTeam: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const memberOf = await ctx.db.teamMember.findMany({
        where: {
          userId: input.userId
        }
      })

      const teams = await Promise.all(
        memberOf.map(async (currentTeam) => {
          const team = await ctx.db.team.findFirst({
            where: {
              teamId: currentTeam.teamId
            }
          })
          if (!team) throw new Error(`Team not found :(\nteamId: ${currentTeam.teamId}`);
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

        const result = await ctx.db.$transaction(async () => {
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

        return result;  
      } catch (error) {
        throw new Error("Failed to create team :(");
      }
    }),

  updateTeam: protectedProcedure
    .input(
      z.object({ 
        userRole: z.nativeEnum(Role),
        teamId: z.string(),
        name: z.string().min(1),
        description: z.string().nullable()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userRole, teamId, name, description } = input;

      if (userRole === "normal") throw new Error("Unauthorised, you do not have perms >:(");

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
        userRole: z.nativeEnum(Role),
        teamId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userRole, teamId } = input;

      if (userRole !== "owner") throw new Error("Unauthorised, you do not have perms >:(");

      try {
        const result = await ctx.db.$transaction([
          ctx.db.teamMember.deleteMany({
            where: {
              teamId: teamId,
            },
          }),
          ctx.db.team.delete({
            where: { teamId: teamId },
          }),
        ]);
  
        return result;
      } catch (error) {
        throw new Error("Failed to delete team :(");
      }
    }),

});

export default teamRouter