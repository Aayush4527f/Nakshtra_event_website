import { z } from "zod";

export const SignupSchema=z.object({
    username:z.string().min(3),
    email:z.string().email(),
    password:z.string().min(6)
})

export const LoginSchema=z.object({
    email:z.string().email(),
    password:z.string().min(6)
})

export const addEventSchema=z.object({
    name:z.string().min(3),
    description:z.string().min(3),
    price:z.string().min(3),
    image:z.string().min(3).optional(),
    adminid:z.string().min(3)
})

export const registerschema = z.object({
    eventId: z.number(),
    userId: z.number(),
  });
