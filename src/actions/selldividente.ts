// actions/selldividente.ts
"use server";
import { z } from "zod";
import { createdOrUpdated } from "@/lib/api";
import { INITIATE_ACTIONS_SALE_URL, APPROVE_SALE_URL, REJECT_SALE_URL, GET_MY_SALE_REQUESTS_URL, UPDATE_PROFILE_URL } from "./endpoint";

// Schéma de validation pour la vente d'actions
const ActionsSaleSchema = z.object({
  nombre_actions: z.number()
    .int({ message: "Le nombre d'actions doit être un nombre entier" })
    .min(1, { message: "Le nombre d'actions doit être supérieur à 0" })
    .max(1000000, { message: "Valeur trop élevée" }),
  motif: z.string().optional()
});

// Schéma pour l'approbation d'une demande
const ApproveRequestSchema = z.object({
  demandeId: z.string(),
  commentaire: z.string().optional()
});

// Schéma pour le rejet d'une demande
const RejectRequestSchema = z.object({
  demandeId: z.string(),
  commentaire: z.string()
});

/**
 * Initier une demande de vente d'actions
 */

/**
 * Approuver une demande de vente
 */
export const approveActionsSaleRequest = async (formData) => {
 // console.log('✅ Approbation demande de vente:', formData);

  try {
    // Validation des données
    const validation = ApproveRequestSchema.safeParse(formData);

    if (!validation.success) {
     // console.log('❌ Erreur de validation:', validation.error.flatten().fieldErrors);
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors 
      };
    }

    const validatedData = validation.data;
    //console.log('✅ Données validées:', validatedData);

    // Appel à l'API d'approbation
    const response = await createdOrUpdated({
      url: `${APPROVE_SALE_URL}/${validatedData.demandeId}`,
      data: { commentaire: validatedData.commentaire },
      updated:true
    });

    //console.log('🔄 Réponse API:', response);

    if (response.success) {
      return {
        type: "success",
        message: response.message,
        data: {
          demande: response.demande,
          user_after_transaction: response.user_after_transaction
        }
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de l'approbation de la demande"
      };
    }

  } catch (error) {
    console.error("❌ Erreur dans approveActionsSaleRequest:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de l'approbation de la demande"
    };
  }
};
export const updateProfile = async (state: any, formData: FormData) => {
  try {
    // Extraire les données du formulaire
    const updateData: any = {};
    
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const telephone = formData.get("telephone");
    const adresse = formData.get("adresse");
    const nationalite = formData.get("nationalite");
    const ville = formData.get("ville");
     const cni = formData.get("cni");
    const pays = formData.get("pays");
    const dateNaissance = formData.get("dateNaissance");

    // N'ajouter que les champs qui ont été fournis
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
     if (cni) updateData.cni = cni;
    if (telephone) updateData.telephone = telephone;
    if (adresse) updateData.adresse = adresse;
    if (nationalite) updateData.nationalite = nationalite;
    if (ville) updateData.ville = ville;
    if (pays) updateData.pays = pays;
    if (dateNaissance) updateData.dateNaissance = dateNaissance;

    // Appel à l'API via createdOrUpdated
    const response = await createdOrUpdated({
      url: UPDATE_PROFILE_URL,
      data: updateData,
      updated: true 
    });

    if (response.success) {
      return {
        type: "success",
        message: response.message || "Profil mis à jour avec succès",
        user: response.user
      };
    } else {
      return {
        type: "error",
        message: response.message || "Échec de la mise à jour du profil"
      };
    }

  } catch (error: any) {
    console.error("❌ Erreur dans updateProfile:", error);
    
    if (error?.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Une erreur s'est produite lors de la mise à jour du profil"
    };
  }
};
/**
 * Rejeter une demande de vente
 */
export const rejectActionsSaleRequest = async (formData) => {
 // console.log('❌ Rejet demande de vente:', formData);

  try {
    // Validation des données
    const validation = RejectRequestSchema.safeParse(formData);

    if (!validation.success) {
     // console.log('❌ Erreur de validation:', validation.error.flatten().fieldErrors);
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors 
      };
    }

    const validatedData = validation.data;
    //console.log('✅ Données validées:', validatedData);

    // Appel à l'API de rejet
    const response = await createdOrUpdated({
      url: `${REJECT_SALE_URL}/${validatedData.demandeId}`,
      data: { commentaire: validatedData.commentaire },
       updated:true
    });

    //console.log('🔄 Réponse API:', response);

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
        message: response.message || "Erreur lors du rejet de la demande"
      };
    }

  } catch (error) {
    console.error("❌ Erreur dans rejectActionsSaleRequest:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors du rejet de la demande"
    };
  }
};

/**
 * Récupérer mes demandes de vente
 */
export const getMySaleRequests = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Ajouter les paramètres à l'URL
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    }
    
    const url = `${GET_MY_SALE_REQUESTS_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return {
        type: "success",
        data: {
          demandes: data.demandes,
          pagination: data.pagination,
          statistiques: data.statistiques
        }
      };
    } else {
      return {
        type: "error",
        message: data.message || "Erreur lors de la récupération des demandes"
      };
    }
  } catch (error) {
    console.error("❌ Erreur dans getMySaleRequests:", error);
    return {
      type: "error",
      message: "Erreur lors de la récupération des demandes"
    };
  }
};