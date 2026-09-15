import { z } from "zod";

export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
    role: z.string(),
    createdAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;
