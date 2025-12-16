"use server";

import axios from "axios";
import { LOGIN_URL, REGISTER_URL_FOR_ACTIONNAIRE } from "./endpoint";
import { LoginSchema, RegisterSchema } from "@/schemas/loginschema";

/* export const login = async (state: any, formData: FormData) => {
  try {
    // Validation avec zod
    const validatedFields = LoginSchema.safeParse({
      telephone: formData.get("telephone"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { telephone, password } = validatedFields.data;

    // Faire une requête POST pour connecter l'utilisateur
    const res = await axios.post(LOGIN_URL, {
      telephone,
      password,
    });


    // Vérifiez si la réponse contient un message indiquant que l'OTP a été envoyé
    // Gérer les deux formats: requireOTP et requiresOtp
    if (res.data.requireOTP || res.data.requiresOtp || 
        res.data.message.includes("code de vérification") || 
        res.data.message.includes("WhatsApp")) {
      return {
        requiresOtp: true, // Toujours retourner requiresOtp (avec s et p minuscule)
        telephone: telephone,
        userId: res.data.userId,
        type: "success",
        message: "Veuillez entrer le code OTP envoyé à votre numéro de téléphone",
      };
    } else {
      return {
        type: "error",
        message: res.data.message || "Échec de la connexion",
      };
    }
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      type: "error",
      message: error?.response?.data?.message || "Une erreur s'est produite lors de la connexion",
    };
  }
}; */

import { cookies } from "next/headers";
import { getRedirectUrlForRole } from "../../routes";

export const login = async (state: any, formData: FormData) => {
  try {
    // Validation avec zod
    const validatedFields = LoginSchema.safeParse({
      telephone: formData.get("telephone"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { telephone, password } = validatedFields.data;

    // Faire une requête POST pour connecter l'utilisateur
    const res = await axios.post(LOGIN_URL, {
      telephone,
      password,
    });

    if (!res.data || !res.data.user) {
      return {
        type: "error",
        message: "Réponse invalide du serveur",
      };
    }

    const { token, user } = res.data;
    const role = user.role;

    // Si le token est présent, connecter l'utilisateur
    if (token) {
      // Configurer le cookie
      const cookieStore = await cookies();
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 heures
        path: "/",
      });

      // Obtenir l'URL de redirection en fonction du rôle
      const urlToRedirect = getRedirectUrlForRole(role);

      return {
        type: "redirect",
        url: urlToRedirect || "/dashboard",
        message: "Connexion réussie",
      };
    } else {
      return {
        type: "error",
        message: "Token manquant dans la réponse",
      };
    }
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      type: "error",
      message: error?.response?.data?.message || "Une erreur s'est produite lors de la connexion",
    };
  }
};

export const register = async (state: any, formData: FormData) => {
  try {
    // Validation avec zod
    const validatedFields = RegisterSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      telephone: formData.get("telephone"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { firstName, lastName, telephone, password } = validatedFields.data;

    // Faire une requête POST pour e
    const res = await axios.post(REGISTER_URL_FOR_ACTIONNAIRE, {
      firstName,
      lastName,
      telephone,
      password,
    });

    if (res.data.success || res.status === 200 || res.status === 201) {
      return {
        type: "success",
        message: res.data.message || "Inscription réussie ! Vous pouvez maintenant vous connecter.",
      };
    } else {
      return {
        type: "error",
        message: res.data.message || "Échec de l'inscription",
      };
    }
  } catch (error: any) {
    console.error("Register error:", error);
    return {
      type: "error",
      message: error?.response?.data?.message || "Une erreur s'est produite lors de l'inscription",
    };
  }
};

export async function logout() {
  const { cookies } = await import("next/headers");
  (await cookies()).delete("token");
  const { redirect } = await import("next/navigation");
  redirect("/auth/login");
}