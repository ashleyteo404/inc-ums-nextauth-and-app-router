import { postRouter } from "~/server/api/routers/post";
import { createTRPCRouter } from "~/server/api/trpc";
import teamRouter from "./routers/team";
import teamMemberRouter from "./routers/teamMember";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  team: teamRouter,
  teamMember: teamMemberRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
