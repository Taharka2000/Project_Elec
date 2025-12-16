// src/schemas/register.ts
import { z } from "zod";

// src/schemas/register.ts

//acepted type
const AcceptedEFileType = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
//maximu size file allowed
const MaxFileSizeUpload: number = 1024 * 1024 * 5; // 5Mb

export const RegisterSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().min(1, "Le numéro de téléphone est requis"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  imgUser: z.instanceof(File).refine((file) => {
    return !file || file.size <= MaxFileSizeUpload;
  }, "La taille du fichier ne doit pas dépasser 5MB.")
    .nullish(),
  termsAccepted: z.boolean().refine((val) => val === true, "Vous devez accepter les conditions générales"),
  privacyPolicyAccepted: z.boolean().refine((val) => val === true, "Vous devez accepter les conditions générales"),
  role: z.string(),

  // Champs optionnels
  mediaName: z.string().optional().or(z.literal("")),
  mediaPhone: z.string().optional().or(z.literal("")),
  mediaEmail: z.string().optional().or(z.literal("")),
  descriptionOrganization: z.string().optional().or(z.literal("")),
  descriptionMedia: z.string().optional().or(z.literal("")),
  responsibleName: z.string().optional().or(z.literal("")),
  mediaWebsite: z.string().optional().or(z.literal("")),
  organizationName: z.string().optional().or(z.literal("")),
  organizationAddress: z.string().optional().or(z.literal("")),
  organizationWebsite: z.string().optional().or(z.literal("")),
  companyName: z.string().optional().or(z.literal("")),
  companyAddress: z.string().optional().or(z.literal("")),
  pressCard: z.instanceof(File).refine((file) => {
    return !file || file.size <= MaxFileSizeUpload;
  }, "La taille du fichier ne doit pas dépasser 5MB.")
    .nullish().optional(),
  expertiseDomain: z.string().optional().or(z.literal("")),
  bankDetails: z.string().optional().or(z.literal("")),
  providerSpecialty: z.string().optional().or(z.literal("")),
  clientNotes: z.string().optional().or(z.literal("")),
  subRole: z.string().optional(),
  parentOrganizer: z.string().optional(),
})

export const UpdateProfileSchema = z.object({
  userId: z.string().optional(),
  firstName: z.string().min(1, "Le prénom est requis").optional(),
  lastName: z.string().min(1, "Le nom est requis").optional(),
  phone: z.string().min(1, "Le numéro de téléphone est requis").optional(),
  email: z.string().email("Format d'email invalide").optional(),

  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").optional(),
  newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").optional(),
  role: z.string().optional(),
  termsAccepted: z.boolean().optional(),
  privacyPolicyAccepted: z.boolean().optional(),

  imgUser: z.instanceof(File).refine(
    (file) => !file || file.size <= MaxFileSizeUpload,
    "La taille du fichier ne doit pas dépasser 5MB."
  ).nullish(),

  mediaName: z.string().optional().or(z.literal("")),
  mediaPhone: z.string().optional().or(z.literal("")),
  mediaEmail: z.string().optional().or(z.literal("")),
  descriptionOrganization: z.string().optional().or(z.literal("")),
  descriptionMedia: z.string().optional().or(z.literal("")),
  responsibleName: z.string().optional().or(z.literal("")),
  mediaWebsite: z.string().optional().or(z.literal("")),
  organizationName: z.string().optional().or(z.literal("")),
  organizationAddress: z.string().optional().or(z.literal("")),
  organizationWebsite: z.string().optional().or(z.literal("")),
  companyName: z.string().optional().or(z.literal("")),
  companyAddress: z.string().optional().or(z.literal("")),
  pressCard: z.instanceof(File).refine(
    (file) => !file || file.size <= MaxFileSizeUpload,
    "La taille du fichier ne doit pas dépasser 5MB."
  ).nullish().optional(),

  expertiseDomain: z.string().optional().or(z.literal("")),
  bankDetails: z.string().optional().or(z.literal("")),
  providerSpecialty: z.string().optional().or(z.literal("")),
  clientNotes: z.string().optional().or(z.literal("")),
  subRole: z.string().optional(),
  parentOrganizer: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.userId) {
    if (!data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Le mot de passe est requis",
      });
    }
    if (!data.role) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["role"],
        message: "Le rôle est requis",
      });
    }
    if (data.termsAccepted === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["termsAccepted"],
        message: "Vous devez accepter les conditions d'utilisation",
      });
    }
    if (data.privacyPolicyAccepted === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["privacyPolicyAccepted"],
        message: "Vous devez accepter la politique de confidentialité",
      });
    }
  }
});