import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure
} from "~/server/api/trpc";

const userRouter = createTRPCRouter({
    registerUser: publicProcedure
      .input(
        z.object({
            email: z.string().email(),
            name: z.string().min(2),
            hashedPassword: z.string()
        })
      )
      .mutation(async ({ctx, input}) => {
        try {
            const { email, name, hashedPassword } = input;
    
            const exists = await ctx.db.user.findFirst({
                where: {
                    email: email
                }
            });
            
            if (exists) {
                throw new TRPCError({ code: "CONFLICT", message: "Email already in use :("});
            } else {
                return ctx.db.user.create({
                    data: {
                        email: email,
                        name: name,
                        hashedPassword: hashedPassword
                    }
                }) 
            }            
          } catch (error) {
            throw error;
          }
      }),

    testProtectedProcedure: protectedProcedure
      .mutation(async ({}) => {
        try {
          return { success: true };
        } catch (error) {
          throw new Error("Failed to call protected procedure :(");
        }
      })
});

export default userRouter