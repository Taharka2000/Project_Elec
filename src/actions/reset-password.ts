"use server";

import { ResetPasswordSchema, VerifyResetOTPSchema } from "@/app/auth/_models/reset-password-schema";
import axios from "axios";
import { REQUEST_PASSWORD_RESET_URL, RESEND_RESET_OTP_URL, VERIFY_RESET_OTP_URL } from "./endpoint";




// Action pour demander un OTP de réinitialisation
export const requestPasswordReset = async (state: any, formData: FormData) => {
  try {
    // Validation avec zod
    const validatedFields = ResetPasswordSchema.safeParse({
      telephone: formData.get("telephone"),
    });

    if (!validatedFields.success) {
      return { 
        errors: validatedFields.error.flatten().fieldErrors,
        type: "error"
      };
    }

    const { telephone } = validatedFields.data;

    // Faire une requête POST pour demander l'OTP de réinitialisation
    const res = await axios.post(REQUEST_PASSWORD_RESET_URL, {
      telephone,
    });


    if (res.data.success) {
      return {
        requiresOtp: true,
        telephone: telephone,
        userId: res.data.userId,
        type: "success",
        message: "Un code de réinitialisation a été envoyé à votre numéro WhatsApp",
        expiresIn: res.data.expiresIn || "10 minutes"
      };
    } else {
      return {
        type: "error",
        message: res.data.message || "Échec de l'envoi du code de réinitialisation",
      };
    }
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return {
      type: "error",
      message: error?.response?.data?.message || "Une erreur s'est produite lors de la demande de réinitialisation",
    };
  }
};

// Action pour vérifier l'OTP et réinitialiser le mot de passe
export const verifyResetOTP = async (state: any, formData: FormData) => {
  try {
    // Validation avec zod
    const validatedFields = VerifyResetOTPSchema.safeParse({
      userId: formData.get("userId"),
      otpCode: formData.get("otpCode"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
      return { 
        errors: validatedFields.error.flatten().fieldErrors,
        type: "error"
      };
    }

    const { userId, otpCode, newPassword, confirmPassword } = validatedFields.data;

    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      return {
        type: "error",
        message: "Les mots de passe ne correspondent pas",
        errors: {
          confirmPassword: ["Les mots de passe ne correspondent pas"]
        }
      };
    }

    // Envoyer une requête pour vérifier l'OTP et réinitialiser le mot de passe
    const res = await axios.post(VERIFY_RESET_OTP_URL, {
      userId,
      otpCode,
      newPassword,
    });

  

    if (res.data.success) {
      return {
        type: "redirect",
        url: "/auth/login",
        message: "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.",
      };
    } else {
      return {
        type: "error",
        message: res.data.message || "Erreur lors de la réinitialisation du mot de passe",
      };
    }
  } catch (error: any) {
    console.error("Reset password verification error:", error);
    return {
      type: "error",
      message: error?.response?.data?.message || "Erreur lors de la vérification du code OTP",
    };
  }
};

// Action pour renvoyer un OTP de réinitialisation
export const resendResetOTP = async (userId: string) => {
  try {
    const res = await axios.post(RESEND_RESET_OTP_URL, {
      userId,
    });


    if (res.data.success) {
      return {
        type: "success",
        message: "Un nouveau code de réinitialisation a été envoyé",
      };
    } else {
      return {
        type: "error",
        message: res.data.message || "Erreur lors du renvoi du code",
      };
    }
  } catch (error: any) {
    console.error("Resend reset OTP error:", error);
    return {
      type: "error",
      message: error?.response?.data?.message || "Erreur lors du renvoi du code OTP",
    };
  }
};