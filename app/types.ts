import * as z from "zod";

export const BirthdaySchema = z.object({
    id: z.string(),
    userId: z.string(),
    month: z.number(),
    day: z.number(),
    nextBirthday: z.number(),
    name: z.string().min(1, { message: "Must be at least 1 letter." }).max(10).trim(),
    lastName: z.string().optional(),
    onDay: z.boolean().default(true),
    dayBefore: z.boolean().default(false),
    oneWeekBefore: z.boolean().default(false),
    twoWeeksBefore: z.boolean().default(false)
});

export type Birthday = z.infer<typeof BirthdaySchema>;