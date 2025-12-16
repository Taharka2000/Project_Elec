import { z } from "zod";

export const LoginSchema = z.object({
  telephone: z
    .string()
    .min(8, { message: "Le numéro de téléphone doit avoir au moins 8 chiffres" })
    .regex(/^[+]?[\d\s\-\(\)]+$/, { 
      message: "Entrez un numéro de téléphone valide" 
    }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit avoir au moins 8 caractères" }),
});

export const RegisterSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  telephone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "Confirmez votre mot de passe"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});