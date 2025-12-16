// schemas/reset-password-schema.ts
import { z } from "zod";

// Schéma pour la demande de réinitialisation
export const ResetPasswordSchema = z.object({
  telephone: z
    .string()
    .min(1, "Le numéro de téléphone est requis")
    .regex(/^[0-9+\-\s()]+$/, "Format de numéro de téléphone invalide")
    .min(9, "Le numéro de téléphone doit contenir au moins 9 chiffres"),
});

// Schéma pour la vérification OTP et nouveau mot de passe
export const VerifyResetOTPSchema = z.object({
  userId: z.string().min(1, "ID utilisateur requis"),
  otpCode: z
    .string()
    .min(6, "Le code OTP doit contenir 6 chiffres")
    .max(6, "Le code OTP doit contenir 6 chiffres")
    .regex(/^[0-9]+$/, "Le code OTP ne doit contenir que des chiffres"),
  newPassword: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .max(100, "Le mot de passe ne peut pas dépasser 100 caractères"),
  confirmPassword: z
    .string()
    .min(1, "Veuillez confirmer votre mot de passe"),
});

// Type pour le formulaire de demande de réinitialisation
export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;

// Type pour le formulaire de vérification OTP
export type VerifyResetOTPType = z.infer<typeof VerifyResetOTPSchema>;