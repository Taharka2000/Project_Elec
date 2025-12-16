import axios from "axios";

import { RegisterSchema } from "@/schemas/registerShema";

import { CHANGE_PASSWORD_URL, REGISTER_INITIATE_URL, REGISTER_RESEND_OTP_URL, REGISTER_URL, REGISTER_VERIFY_OTP_URL } from "./endpoint";
import { RequestData } from "@/lib/types";
import { cookies } from "next/headers";

export const register = async (state: any, formData: any) => {
    try {
       

        // Validation avec Zod
        const validationResult = RegisterSchema.safeParse(formData);

        if (!validationResult.success) {
            const errors = validationResult.error.flatten();
            return {
                type: "error",
                message: "Erreur de validation",
                errors: errors.fieldErrors
            };
        }

        const validatedData = validationResult.data;

        // Préparation des données
        const requestData: RequestData = {
            nom: validatedData.nom,
            prenom: validatedData.prenom,
            email: validatedData.email,
            password: validatedData.password,
            telephone: validatedData.telephone,
            nomEntreprise: validatedData.nomEntreprise,
            ninea: validatedData.ninea,
            dateCreation: validatedData.dateCreation,
            rccm: validatedData.rccm,
            representéPar: validatedData.representéPar
        };

       
        const res = await axios.post(REGISTER_URL, requestData);


   

        return {
            type: "success",
            message: "Inscription réussie",
        };

    } catch (error: any) {
        console.error("Erreur lors de l'inscription:", error);

        if (error.response) {
            return {
                type: "error",
                message: error.response.data?.message || `Erreur ${error.response.status}: ${error.response.statusText}`
            };
        } else if (error.request) {
            return {
                type: "error",
                message: "Impossible de joindre le serveur. Veuillez réessayer.",
            };
        } else {
            return {
                type: "error",
                message: "Une erreur inattendue s'est produite.",
            };
        }
    }
};

export const changePassword = async (state: any, formData: FormData) => {
    try {
        // Récupérer les données du FormData
        const userId = formData.get("userId") as string;
        const currentPassword = formData.get("password") as string;
        const newPassword = formData.get("newPassword") as string;

      

        // Validation basique
        if (!userId || !currentPassword || !newPassword) {
            return {
                type: "error",
                message: "Tous les champs sont requis."
            };
        }

        if (newPassword.length < 6) {
            return {
                type: "error",
                message: "Le nouveau mot de passe doit contenir au moins 6 caractères."
            };
        }

        // Préparation des données pour l'API
        const requestData = {
            userId,
            currentPassword,
            newPassword
        };

    
        
        // Appel à votre API backend
        const res = await axios.post(CHANGE_PASSWORD_URL, requestData);

   

        return {
            type: "success",
            message: "Mot de passe changé avec succès !",
        };

    } catch (error: any) {
        console.error("Erreur lors du changement de mot de passe:", error);

        if (error.response) {
            return {
                type: "error",
                message: error.response.data?.message || `Erreur ${error.response.status}: ${error.response.statusText}`
            };
        } else if (error.request) {
            return {
                type: "error",
                message: "Impossible de joindre le serveur. Veuillez réessayer.",
            };
        } else {
            return {
                type: "error",
                message: "Une erreur inattendue s'est produite.",
            };
        }
    }
};

// export const initiateRegister = async (state: any, formData: FormData) => {

//     /* console.log("🔵 [Server Action] initiateRegister appelée"); */
    
//     try {
//         const firstName = formData.get("firstName") as string;
//         const lastName = formData.get("lastName") as string;
//         const telephone = formData.get("telephone") as string;
//         const password = formData.get("password") as string;
//         const confirmPassword = formData.get("confirmPassword") as string;

//       /*   console.log("📝 [Server Action] Données extraites:", {
//             firstName,
//             lastName,
//             telephone,
//             hasPassword: !!password,
//             hasConfirmPassword: !!confirmPassword
//         }); */

//         // Validation basique côté client
//         if (!firstName || !lastName || !telephone || !password || !confirmPassword) {
//             //console.log("❌ [Server Action] Validation échouée: champs manquants");
//             return {
//                 requiresOtp: false,
//                 telephone: "",
//                 tempUserId: "",
//                 type: "error",
//                 message: "Tous les champs sont requis.",
//                 errors: {}
//             };
//         }

//         if (password !== confirmPassword) {
//             //console.log("❌ [Server Action] Mots de passe différents");
//             return {
//                 requiresOtp: false,
//                 telephone: "",
//                 tempUserId: "",
//                 type: "error",
//                 message: "Les mots de passe ne correspondent pas.",
//                 errors: {}
//             };
//         }

//         if (password.length < 6) {
//            // console.log("❌ [Server Action] Mot de passe trop court");
//             return {
//                 requiresOtp: false,
//                 telephone: "",
//                 tempUserId: "",
//                 type: "error",
//                 message: "Le mot de passe doit contenir au moins 6 caractères.",
//                 errors: {}
//             };
//         }

//         const requestData = {
//             firstName,
//             lastName,
//             telephone,
//             password,
//             confirmPassword
//         };

//         /* console.log("🌐 [Server Action] URL:", REGISTER_INITIATE_URL);
//         console.log("📤 [Server Action] Envoi requête..."); */
        
//         const res = await axios.post("https://api.actionnaire.diokoclient.com/api/auth/signup/initiate", requestData, {
//             timeout: 15000,
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         });
// /* 
//         console.log("✅ [Server Action] Réponse:", {
//             status: res.status,
//             success: res.data?.success,
//             hasTempUserId: !!res.data?.tempUserId
//         });
//  */
//         if (res.data.success) {
//             return {
//                 requiresOtp: true,
//                 telephone: telephone,
//                 tempUserId: res.data.tempUserId,
//                 type: "success",
//                 message: res.data.message || "Code de vérification envoyé via WhatsApp",
//                 errors: {}
//             };
//         } else {
//             return {
//                 requiresOtp: false,
//                 telephone: "",
//                 tempUserId: "",
//                 type: "error",
//                 message: res.data.message || "Erreur lors de l'initiation",
//                 errors: res.data.errors || {}
//             };
//         }

//     } catch (error: any) {
//         console.error("💥 [Server Action] Erreur complète:", {
//             name: error.name,
//             message: error.message,
//             code: error.code,
//             response: error.response?.data,
//             status: error.response?.status,
//             stack: error.stack?.split('\n').slice(0, 3)
//         });

//         if (error.response) {
//             return {
//                 requiresOtp: false,
//                 telephone: "",
//                 tempUserId: "",
//                 type: "error",
//                 message: error.response.data?.message || `Erreur ${error.response.status}`,
//                 errors: error.response.data?.errors || {}
//             };
//         } else if (error.request) {
//             return {
//                 requiresOtp: false,
//                 telephone: "",
//                 tempUserId: "",
//                 type: "error",
//                 message: "Impossible de joindre le serveur. Veuillez réessayer.",
//                 errors: {}
//             };
//         } else {
//             return {
//                 requiresOtp: false,
//                 telephone: "",
//                 tempUserId: "",
//                 type: "error",
//                 message: error.message || "Une erreur inattendue s'est produite.",
//                 errors: {}
//             };
//         }
//     }
// };

// Action pour vérifier l'OTP et créer le compte

export const initiateRegister = async (state: any, formData: FormData) => {
    try {
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const telephone = formData.get("telephone") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // Validation basique côté client
        if (!firstName || !lastName || !telephone || !password || !confirmPassword) {
            return {
                type: "error",
                message: "Tous les champs sont requis.",
                errors: {}
            };
        }

        if (password !== confirmPassword) {
            return {
                type: "error",
                message: "Les mots de passe ne correspondent pas.",
                errors: {}
            };
        }

        if (password.length < 6) {
            return {
                type: "error",
                message: "Le mot de passe doit contenir au moins 6 caractères.",
                errors: {}
            };
        }

        const requestData = {
            firstName,
            lastName,
            telephone,
            password,
            confirmPassword
        };
        
        // Appel direct à l'API de création de compte (sans OTP)
        const res = await axios.post("https://api.actionnaire.diokoclient.com/api/auth/signup/initiate", requestData, {
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (res.data.success) {

            return {
                type: "success",
                message: res.data.message || "Compte créé avec succès !",
                user: res.data.user,
                errors: {}
            };
        } else {
            return {
                type: "error",
                message: res.data.message || "Erreur lors de la création du compte",
                errors: res.data.errors || {}
            };
        }

    } catch (error: any) {
        console.error("💥 [Server Action] Erreur complète:", {
            name: error.name,
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
        });

        if (error.response) {
            return {
                type: "error",
                message: error.response.data?.message || `Erreur ${error.response.status}`,
                errors: error.response.data?.errors || {}
            };
        } else if (error.request) {
            return {
                type: "error",
                message: "Impossible de joindre le serveur. Veuillez réessayer.",
                errors: {}
            };
        } else {
            return {
                type: "error",
                message: error.message || "Une erreur inattendue s'est produite.",
                errors: {}
            };
        }
    }
};
export const verifyRegisterOtp = async (state: any, formData: FormData) => {
    try {
        // Récupérer les données du FormData
        const tempUserId = formData.get("tempUserId") as string;
        const otpCode = formData.get("otpCode") as string;

       // console.log("Vérification OTP:", { tempUserId, otpCode });

        // Validation basique
        if (!tempUserId || !otpCode) {
            return {
                type: "error",
                message: "Données manquantes pour la vérification.",
                url: ""
            };
        }

        if (otpCode.length !== 6) {
            return {
                type: "error",
                message: "Le code de vérification doit contenir 6 chiffres.",
                url: ""
            };
        }

        // Préparation des données pour l'API
        const requestData = {
            tempUserId,
            otpCode
        };

       // console.log("Données envoyées pour vérification:", requestData);
        
        // Appel à votre API backend pour vérifier l'OTP
        const res = await axios.post("https://api.actionnaire.diokoclient.com/api/auth/signup/verify", requestData);

      //  console.log("Réponse de vérification:", res.data);

        if (res.data.success) {
            // Note: On ne définit pas le cookie ici car l'utilisateur doit se connecter
            // Le token sera défini lors de la connexion sur /auth/login

            return {
                type: "redirect",
                message: "Compte créé avec succès ! Vous pouvez maintenant vous connecter.",
                url: "/auth/login"
            };
        } else {
            return {
                type: "error",
                message: res.data.message || "Code de vérification invalide",
                url: ""
            };
        }

    } catch (error: any) {
        console.error("Erreur lors de la vérification OTP:", error);

        if (error.response) {
            return {
                type: "error",
                message: error.response.data?.message || `Erreur ${error.response.status}: ${error.response.statusText}`,
                url: ""
            };
        } else if (error.request) {
            return {
                type: "error",
                message: "Impossible de joindre le serveur. Veuillez réessayer.",
                url: ""
            };
        } else {
            return {
                type: "error",
                message: "Une erreur inattendue s'est produite.",
                url: ""
            };
        }
    }
};

// Action pour renvoyer l'OTP
export const resendRegisterOtp = async (state: any, formData: FormData) => {
    try {
        // Récupérer les données du FormData
        const tempUserId = formData.get("tempUserId") as string;

    //    console.log("Renvoi OTP pour:", tempUserId);

        // Validation basique
        if (!tempUserId) {
            return {
                type: "error",
                message: "Identifiant de session manquant."
            };
        }

        // Préparation des données pour l'API
        const requestData = {
            tempUserId
        };

      //  console.log("Données envoyées pour renvoi:", requestData);
        
        // Appel à votre API backend pour renvoyer l'OTP
        const res = await axios.post(REGISTER_RESEND_OTP_URL, requestData);

    //    console.log("Réponse de renvoi:", res.data);

        if (res.data.success) {
            return {
                type: "success",
                message: res.data.message || "Nouveau code envoyé via WhatsApp"
            };
        } else {
            return {
                type: "error",
                message: res.data.message || "Erreur lors du renvoi du code"
            };
        }

    } catch (error: any) {
        console.error("Erreur lors du renvoi OTP:", error);

        if (error.response) {
            return {
                type: "error",
                message: error.response.data?.message || `Erreur ${error.response.status}: ${error.response.statusText}`
            };
        } else if (error.request) {
            return {
                type: "error",
                message: "Impossible de joindre le serveur. Veuillez réessayer."
            };
        } else {
            return {
                type: "error",
                message: "Une erreur inattendue s'est produite."
            };
        }
    }
};