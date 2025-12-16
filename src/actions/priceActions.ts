"use server";
import { z } from "zod";
import { createdOrUpdated, deleteWithAxios, fetchJSON } from "@/lib/api";
import {
  GET_ALL_PRICES_URL,
  GET_PRICE_BY_TYPE_URL,
  UPSERT_PRICE_URL,
  DELETE_PRICE_URL,
  GET_ALL_VIP_USERS_URL,
  ADD_VIP_USER_URL,
  REMOVE_VIP_USER_URL,
  CHECK_VIP_STATUS_URL,
  INITIALIZE_SYSTEM_URL
} from "./endpoint";

// ============================================
// SCHÉMAS DE VALIDATION
// ============================================

const UpsertPriceSchema = z.object({
  type: z.enum(['VIP', 'NORMAL'], { message: "Type doit être VIP ou NORMAL" }),
  prix_unitaire: z.number().min(1, { message: "Le prix doit être supérieur à 0" }),
  description: z.string().optional(),
  actif: z.boolean().optional()
});

const DeletePriceSchema = z.object({
  type: z.enum(['VIP', 'NORMAL'], { message: "Type doit être VIP ou NORMAL" })
});

const AddVIPUserSchema = z.object({
  telephone: z.string().min(8, { message: "Numéro de téléphone invalide" }),
  nom: z.string().optional(),
  notes: z.string().optional()
});

const RemoveVIPUserSchema = z.object({
  telephone: z.string().min(8, { message: "Numéro de téléphone invalide" })
});

const CheckVIPStatusSchema = z.object({
  telephone: z.string().min(8, { message: "Numéro de téléphone invalide" })
});

// ============================================
// ACTIONS - PRIX
// ============================================

/**
 * Récupérer tous les prix
 */
export const getAllPrices = async () => {
  try {
    const response = await fetchJSON(GET_ALL_PRICES_URL);

    if (response.success) {
      return {
        type: "success",
        data: response.data
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la récupération des prix"
      };
    }
  } catch (error) {
    console.error("Erreur dans getAllPrices:", error);
    return {
      type: "error",
      message: error.response?.data?.message || "Erreur lors de la récupération des prix"
    };
  }
};

/**
 * Récupérer un prix par type
 */
export const getPriceByType = async (type) => {
  try {
    const response = await fetchJSON(`${GET_PRICE_BY_TYPE_URL}/${type}`);

    if (response.success) {
      return {
        type: "success",
        data: response.data
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la récupération du prix"
      };
    }
  } catch (error) {
    console.error("Erreur dans getPriceByType:", error);
    return {
      type: "error",
      message: error.response?.data?.message || "Erreur lors de la récupération du prix"
    };
  }
};

/**
 * Créer ou mettre à jour un prix
 */
export const upsertPrice = async (formData) => {
  try {
    // Validation des données
    const validation = UpsertPriceSchema.safeParse(formData);

    if (!validation.success) {
      return {
        type: "error",
        errors: validation.error.flatten().fieldErrors,
        message: "Données invalides"
      };
    }

    const validatedData = validation.data;

    // Appel à l'API
    const response = await createdOrUpdated({
      url: UPSERT_PRICE_URL,
      data: validatedData
    });

    if (response.success) {
      return {
        type: "success",
        message: response.message,
        data: response.data
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la mise à jour du prix"
      };
    }
  } catch (error) {
    console.error("Erreur dans upsertPrice:", error);

    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }

    return {
      type: "error",
      message: "Erreur lors de la mise à jour du prix"
    };
  }
};

/**
 * Supprimer un prix
 */
export const deletePrice = async (formData) => {
  try {
    // Validation des données
    const validation = DeletePriceSchema.safeParse(formData);

    if (!validation.success) {
      return {
        type: "error",
        errors: validation.error.flatten().fieldErrors,
        message: "Données invalides"
      };
    }

    const { type } = validation.data;

    // Appel à l'API de suppression
    const response = await deleteWithAxios({
      url: `${DELETE_PRICE_URL}/${type}`
    });

    if (response.success) {
      return {
        type: "success",
        message: response.message
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la suppression du prix"
      };
    }
  } catch (error) {
    console.error("Erreur dans deletePrice:", error);

    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }

    return {
      type: "error",
      message: "Erreur lors de la suppression du prix"
    };
  }
};

// ============================================
// ACTIONS - UTILISATEURS VIP
// ============================================

/**
 * Récupérer tous les utilisateurs VIP
 */
export const getAllVIPUsers = async () => {
  try {
    const response = await fetchJSON(GET_ALL_VIP_USERS_URL);

    if (response.success) {
      return {
        type: "success",
        data: response.data,
        count: response.count
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la récupération des utilisateurs VIP"
      };
    }
  } catch (error) {
    console.error("Erreur dans getAllVIPUsers:", error);
    return {
      type: "error",
      message: error.response?.data?.message || "Erreur lors de la récupération des utilisateurs VIP"
    };
  }
};

/**
 * Ajouter un utilisateur VIP
 */
export const addVIPUser = async (formData) => {
  try {
    // Validation des données
    const validation = AddVIPUserSchema.safeParse(formData);

    if (!validation.success) {
      return {
        type: "error",
        errors: validation.error.flatten().fieldErrors,
        message: "Données invalides"
      };
    }

    const validatedData = validation.data;

    // Appel à l'API
    const response = await createdOrUpdated({
      url: ADD_VIP_USER_URL,
      data: validatedData
    });

    if (response.success) {
      return {
        type: "success",
        message: response.message,
        data: response.data
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de l'ajout de l'utilisateur VIP"
      };
    }
  } catch (error) {
    console.error("Erreur dans addVIPUser:", error);

    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }

    return {
      type: "error",
      message: "Erreur lors de l'ajout de l'utilisateur VIP"
    };
  }
};

/**
 * Supprimer un utilisateur VIP
 */
export const removeVIPUser = async (formData) => {
  try {
    // Validation des données
    const validation = RemoveVIPUserSchema.safeParse(formData);

    if (!validation.success) {
      return {
        type: "error",
        errors: validation.error.flatten().fieldErrors,
        message: "Données invalides"
      };
    }

    const { telephone } = validation.data;

    // Appel à l'API de suppression
    const response = await deleteWithAxios({
      url: `${REMOVE_VIP_USER_URL}/${telephone}`
    });

    if (response.success) {
      return {
        type: "success",
        message: response.message
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la suppression de l'utilisateur VIP"
      };
    }
  } catch (error) {
    console.error("Erreur dans removeVIPUser:", error);

    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }

    return {
      type: "error",
      message: "Erreur lors de la suppression de l'utilisateur VIP"
    };
  }
};

/**
 * Vérifier si un numéro est VIP
 */
export const checkVIPStatus = async (formData) => {
  try {
    // Validation des données
    const validation = CheckVIPStatusSchema.safeParse(formData);

    if (!validation.success) {
      return {
        type: "error",
        errors: validation.error.flatten().fieldErrors,
        message: "Données invalides"
      };
    }

    const { telephone } = validation.data;

    const response = await fetchJSON(`${CHECK_VIP_STATUS_URL}/${telephone}`);

    if (response.success) {
      return {
        type: "success",
        isVIP: response.isVIP,
        data: response.data
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la vérification du statut VIP"
      };
    }
  } catch (error) {
    console.error("Erreur dans checkVIPStatus:", error);
    return {
      type: "error",
      message: error.response?.data?.message || "Erreur lors de la vérification du statut VIP"
    };
  }
};

/**
 * Initialiser le système (prix + VIP)
 */
export const initializeSystem = async () => {
  try {
    const response = await createdOrUpdated({
      url: INITIALIZE_SYSTEM_URL,
      data: {}
    });

    if (response.success) {
      return {
        type: "success",
        message: response.message,
        data: response.data
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de l'initialisation du système"
      };
    }
  } catch (error) {
    console.error("Erreur dans initializeSystem:", error);

    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }

    return {
      type: "error",
      message: "Erreur lors de l'initialisation du système"
    };
  }
};