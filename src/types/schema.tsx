import { z } from "zod";

export const teamSchema = z.object({
    name: z.string().min(1),
    description: z.string().nullable()
});

export const memberSchema = z.object({
    name: z.string().min(1),
    email: z.string().min(1).email(),
});