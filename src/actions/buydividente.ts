"use server";
import { z } from "zod";
import { createdOrUpdated } from "@/lib/api";
import { INITIATE_ACTIONS_PURCHASE_URL, INITIATE_ACTIONS_SALE_URL, PURCHASE_ACTIONS_WITH_DIVIDENDS_URL, RESEND_OTP_URL, SELL_ACTIONS_BETWEEN_USERS_URL, VERIFY_OTP_URL } from "./endpoint";

// Schéma de validation pour l'achat d'actions classique avec OTP
const ActionsPurchaseSchema = z.object({
  nombre_actions: z.number()
    .positive({ message: "Le nombre d'actions doit être supérieur à 0" })
    .max(10000, { message: "Impossible d'acheter plus de 10 000 actions à la fois" })
    .refine((val) => {
      // Vérifier que le nombre n'a pas plus de 3 décimales
      const decimals = val.toString().split('.')[1];
      return !decimals || decimals.length <= 3;
    }, { message: "Le nombre d'actions ne peut avoir plus de 3 décimales" }),
  telephonePartenaire: z.string().optional(),
  otpPartenaire: z.string().optional(), // Code OTP fourni par le partenaire
});

// Schéma pour renvoyer un OTP
const ResendOTPSchema = z.object({
  telephonePartenaire: z.string()
    .min(8, { message: "Le numéro de téléphone doit contenir au moins 8 chiffres" })
    .regex(/^\+?[0-9]{8,15}$/, { message: "Format de téléphone invalide" })
});

// Schéma de validation pour l'achat avec dividendes
const DividendPurchaseSchema = z.object({
  nombre_actions: z.number()
    .int({ message: "Le nombre d'actions doit être un nombre entier" })
    .min(1, { message: "Le nombre d'actions doit être supérieur à 0" })
    .max(100, { message: "Impossible d'acheter plus de 100 actions à la fois avec les dividendes" })
});

/**
 * Initier un achat d'actions classique (avec paiement et gestion OTP)
 */
export const initiateActionsPurchase = async (formData) => {
  //console.log('🎯 Initiation achat actions côté client:', formData);

  try {
    // Convertir les données si nécessaire
    const processedData = {
      ...formData,
      nombre_actions: typeof formData.nombre_actions === 'string' 
        ? Number(formData.nombre_actions) 
        : formData.nombre_actions,
    };

    // Validation des données
    const validation = ActionsPurchaseSchema.safeParse(processedData);

    if (!validation.success) {
     // console.log('❌ Erreur de validation:', validation.error.flatten().fieldErrors);
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors 
      };
    }

    const validatedData = validation.data;
    //console.log('✅ Données validées:', validatedData);

    // Appel à l'API d'initiation en utilisant createdOrUpdated
    const response = await createdOrUpdated({
      url: INITIATE_ACTIONS_PURCHASE_URL,
      data: validatedData
    });

   // console.log('🔄 Réponse API:', response);

    // Gestion des différents types de réponses
    if (response.success) {
      return {
        type: "success",
        message: response.message,
        data: {
          payment_info: response.payment_info,
          redirect_url: response.redirect_url
        }
      };
    } else if (response.requireOTP) {
      // Le serveur demande une vérificat
      return {
        type: "otp_required",
        message: response.message,
        data: {
          partnerPhone: response.partnerPhone,
          requireOTP: true
        }
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de l'initiation de l'achat d'actions"
      };
    }

  } catch (error) {
    console.error("❌ Erreur dans initiateActionsPurchase:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de l'initiation de l'achat d'actions"
    };
  }
};

/**
 * Renvoyer un code OTP au partenaire
 */
export const resendOTPForPartner = async (formData) => {
 // console.log('📱 Renvoi OTP partenaire:', formData);

  try {
    // Validation des données
    const validation = ResendOTPSchema.safeParse(formData);

    if (!validation.success) {
    //  console.log('❌ Erreur de validation OTP:', validation.error.flatten().fieldErrors);
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors 
      };
    }

    const validatedData = validation.data;
   // console.log('✅ Données OTP validées:', validatedData);

    // Appel à l'API de renvoi OTP
    const response = await createdOrUpdated({
      url: RESEND_OTP_URL,
      data: validatedData
    });

  //  console.log('🔄 Réponse API renvoi OTP:', response);

    if (response.success) {
      return {
        type: "success",
        message: response.message
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors du renvoi de l'OTP"
      };
    }

  } catch (error) {
    console.error("❌ Erreur dans resendOTPForPartner:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors du renvoi de l'OTP"
    };
  }
};

/**
 * Vérifier un code OTP (si vous voulez une vérification séparée)
 */
export const verifyOTPForPartner = async (formData) => {
 // console.log('🔐 Vérification OTP partenaire:', formData);

  try {
    const response = await createdOrUpdated({
      url: VERIFY_OTP_URL,
      data: formData
    });

   // console.log('🔄 Réponse API vérification OTP:', response);

    if (response.success) {
      return {
        type: "success",
        message: response.message,
        data: response.data
      };
    } else {
      return {
        type: "error",
        message: response.message || "Code OTP invalide"
      };
    }

  } catch (error) {
    console.error("❌ Erreur dans verifyOTPForPartner:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de la vérification de l'OTP"
    };
  }
};

/**
 * Acheter des actions avec les dividendes
 */
export const purchaseActionsWithDividends = async (formData) => {
//  console.log('💰 Initiation achat actions avec dividendes:', formData);

  try {
    // Convertir les données si nécessaire
    const processedData = {
      ...formData,
      nombre_actions: typeof formData.nombre_actions === 'string' 
        ? Number(formData.nombre_actions) 
        : formData.nombre_actions,
    };

    // Validation des données
    const validation = DividendPurchaseSchema.safeParse(processedData);

    if (!validation.success) {
     // console.log('❌ Erreur de validation:', validation.error.flatten().fieldErrors);
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors 
      };
    }

    const validatedData = validation.data;
    //console.log('✅ Données validées:', validatedData);

    // Appel à l'API d'achat avec dividendes
    const response = await createdOrUpdated({
      url: PURCHASE_ACTIONS_WITH_DIVIDENDS_URL,
      data: validatedData
    });

   // console.log('🔄 Réponse API achat dividendes:', response);

    if (response.success) {
      return {
        type: "success",
        message: response.message,
        data: {
          transaction: response.transaction,
          user_updated: response.user_updated,
          actions_achetees: response.actions_achetees,
          dividendes_utilises: response.dividendes_utilises,
          nouvelles_actions_total: response.nouvelles_actions_total,
          nouveaux_dividendes_total: response.nouveaux_dividendes_total
        }
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de l'achat avec dividendes"
      };
    }

  } catch (error) {
    console.error("❌ Erreur dans purchaseActionsWithDividends:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de l'achat avec dividendes"
    };
  }
};

/**
 * Obtenir les informations de prix des actions
 */
export const getActionsPricingInfo = async () => {
  try {
    // Vous pouvez créer un endpoint pour récupérer les infos de prix
    // Ou retourner les valeurs fixes pour l'instant
    return {
      type: "success",
      data: {
        prix_unitaire: 10000, // 10000 FCFA par action
        currency: "XOF",
        subvention_threshold: 1000, // Seuil pour la subvention
        subvention_amount: 10000, // Montant de la subvention
        max_actions_per_purchase: 10000,
        max_actions_with_dividends: 100,
        bonus_partenaire_rate: 0.1 // 10% de bonus partenaire
      }
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des prix:", error);
    return {
      type: "error",
      message: "Impossible de récupérer les informations de prix"
    };
  }
};

/**
 * Calculer combien d'actions peuvent être achetées avec les dividendes disponibles
 */
export const calculateMaxActionsWithDividends = async (dividendsAmount: number) => {
  try {
    const PRIX_UNITAIRE = 10000; // Prix fixe par action
    const maxActions = Math.floor(dividendsAmount / PRIX_UNITAIRE);
    
    return {
      type: "success",
      data: {
        prix_unitaire: PRIX_UNITAIRE,
        dividendes_disponibles: dividendsAmount,
        max_actions_possible: Math.min(maxActions, 100), // Limité à 100
        cout_total_max: Math.min(maxActions, 100) * PRIX_UNITAIRE,
        dividendes_restants: dividendsAmount - (Math.min(maxActions, 100) * PRIX_UNITAIRE)
      }
    };
  } catch (error) {
    console.error("Erreur calcul max actions:", error);
    return {
      type: "error",
      message: "Impossible de calculer le nombre maximum d'actions"
    };
  }
};

const ActionsSaleSchema = z.object({
  nombre_actions: z.number()
    .int({ message: "Le nombre d'actions doit être un nombre entier" })
    .min(1, { message: "Le nombre d'actions doit être supérieur à 0" })
    .max(1000000, { message: "Valeur trop élevée" }),
  motif: z.string().optional()
});

/**
 * Initier une demande de vente d'actions
 */
export const initiateActionsSale = async (formData) => {
///  console.log('🎯 Initiation demande de vente d\'actions:', formData);

  try {
    // Convertir les données si nécessaire
    const processedData = {
      ...formData,
      nombre_actions: typeof formData.nombre_actions === 'string' 
        ? Number(formData.nombre_actions) 
        : formData.nombre_actions,
    };

    // Validation des données
    const validation = ActionsSaleSchema.safeParse(processedData);

    if (!validation.success) {
    //  console.log('❌ Erreur de validation:', validation.error.flatten().fieldErrors);
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors 
      };
    }

    const validatedData = validation.data;
    //console.log('✅ Données validées:', validatedData);

    // Appel à l'API de demande de vente
    const response = await createdOrUpdated({
      url: INITIATE_ACTIONS_SALE_URL,
      data: validatedData
    });

    //('🔄 Réponse API:', response);

    if (response.success) {
      return {
        type: "success",
        message: response.message,
        data: {
          demande: response.demande
        }
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la création de la demande de vente"
      };
    }

  } catch (error) {
    console.error("❌ Erreur dans initiateActionsSale:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de la création de la demande de vente"
    };
  }
};
// Fonction pour vendre des actions entre utilisateurs
export const sellActionsBetweenUser = async (formData) => {
  try {
    // Convertir les données si nécessaire
    const processedData = {
      ...formData,
      nbre_actions: typeof formData.nbre_actions === 'string' 
        ? Number(formData.nbre_actions) 
        : formData.nbre_actions,
      montant: typeof formData.montant === 'string' 
        ? Number(formData.montant) 
        : formData.montant,
    };

    // Validation des données (tu peux créer un schema si nécessaire)
    if (!processedData.nbre_actions || processedData.nbre_actions <= 0) {
      return { 
        type: "error", 
        message: "Le nombre d'actions doit être supérieur à 0"
      };
    }

    if (!processedData.telephone || processedData.telephone.trim() === '') {
      return { 
        type: "error", 
        message: "Le téléphone de l'acheteur est requis"
      };
    }

    if (!processedData.montant || processedData.montant <= 0) {
      return { 
        type: "error", 
        message: "Le montant doit être supérieur à 0"
      };
    }

    // Appel à l'API de vente entre utilisateurs
    const response = await createdOrUpdated({
      url: SELL_ACTIONS_BETWEEN_USERS_URL, // Tu dois définir cette URL
      data: processedData
    });
//console.log("+++++++++++",response);

    if (response) {
      return {
        type: "success",
        message: response.message,
        data: {
          demande: {
            id: response.transaction?._id || '',
            nombre_actions: processedData.nbre_actions,
            prix_unitaire: processedData.montant / processedData.nbre_actions,
            montant_total: processedData.montant,
            date_demande: new Date().toISOString(),
            actions_restantes_apres_vente: response.vendeur?.nouvelles_actions || 0
          }
        }
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la vente entre utilisateurs"
      };
    }

  } catch (error) {
    console.error("❌ Erreur dans sellActionsBetweenUser:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de la vente entre utilisateurs"
    };
  }
};
/**
 * Obtenir les statistiques du partenaire connecté
 */
