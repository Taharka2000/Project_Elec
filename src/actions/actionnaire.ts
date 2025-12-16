// actions/actionnaireActions.js - Ajout de l'action updateUserInfo avec upload de fichier

"use server";
import { z } from "zod";
import { createdOrUpdated, deleteWithAxios, fetchJSON } from "@/lib/api";
import { 
  GET_ACTIONNAIRES_URL, 
  GET_MY_ACTIONS_URL, 
  TOGGLE_ACTIONNAIRE_STATUS_URL,
  RECALCULATE_DIVIDENDES_URL,
  UPDATE_USER_URL,  // Endpoint pour mise à jour
  CREATE_ACTIONNAIRE_URL,  // Endpoint pour création
  ADD_NEW_YEAR_URL,  // Endpoint pour nouvelle année
  DELETE_USER_URL,
  DELETE_MULTIPLE_URL
} from "./endpoint";

// Fonction utilitaire pour récupérer le token d'authentification
async function getAuthToken() {
  try {
    // Récupérer le token depuis les cookies
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    return token?.value || "";
  } catch (error) {
    console.error("Erreur récupération token:", error);
    return "";
  }
}

// Schéma de validation pour le toggle de statut
const ToggleStatusSchema = z.object({
  actionnaireId: z.string().min(1, { message: "ID de l'actionnaire requis" }),
  isBlocked: z.boolean({ message: "Le statut de blocage doit être défini" })
});

// Schéma de validation pour l'ajout d'une nouvelle année (version simple sans fichier)
const AddNewYearSchema = z.object({
  annee: z.number().min(2020).max(2100, { message: "Année invalide" }),
  total_benefice: z.number().min(1, { message: "Le bénéfice doit être supérieur à 0" }),
  rapport: z.string().min(10, { message: "Le rapport doit contenir au moins 10 caractères" })
});

/**
 * Ajouter une nouvelle année de bénéfices avec upload de fichier (Admin)
 */
export const addNewYearBenefices = async (formData) => {
  try {
 

    // Vérifier si on reçoit FormData (avec fichier) ou objet simple
    const isFormDataType = formData instanceof FormData;
    
    if (isFormDataType) {
  
      
      // Validation manuelle pour FormData
      const annee = parseInt(formData.get('annee'));
      const total_benefice = parseFloat(formData.get('total_benefice'));
      const rapport_text = formData.get('rapport_text');
      const fichier = formData.get('rapport');

      // Validation manuelle
      if (!annee || annee < 2020 || annee > 2100) {
        return {
          type: "error",
          message: "Année invalide (doit être entre 2020 et 2100)"
        };
      }

      if (!total_benefice || total_benefice <= 0) {
        return {
          type: "error",
          message: "Le bénéfice doit être supérieur à 0"
        };
      }

      // Au moins un rapport (texte ou fichier) doit être fourni
      if (!rapport_text?.trim() && !fichier) {
        return {
          type: "error",
          message: "Un rapport textuel ou un fichier est requis"
        };
      }

      // Vérifier la taille du fichier côté serveur (si fichier présent)
      if (fichier && fichier.size > 10 * 1024 * 1024) {
        return {
          type: "error",
          message: "Le fichier ne peut pas dépasser 10MB"
        };
      }

      // Préparer FormData finale pour l'API
      const apiFormData = new FormData();
      apiFormData.append('annee', annee.toString());
      apiFormData.append('total_benefice', total_benefice.toString());
      
      // Ajouter le rapport textuel seulement s'il existe
      if (rapport_text?.trim()) {
        apiFormData.append('rapport_text', rapport_text.trim());
      }
      
      // Ajouter le fichier seulement s'il existe
      if (fichier && fichier.size > 0) {
        apiFormData.append('rapport', fichier);
      }

      // Appel direct à l'API avec fetch pour FormData
      const response = await fetch(ADD_NEW_YEAR_URL, {
        method: 'POST',
        headers: {
          // Ne pas définir Content-Type pour FormData
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: apiFormData
      });

      const result = await response.json();
 

      if (result.success) {
        return {
          type: "success",
          message: result.message,
          entreprise: result.entreprise,
          resumeDividendes: result.resumeDividendes,
          fichier: result.fichier // Informations sur le fichier uploadé
        };
      } else {
        return {
          type: "error",
          message: result.message || "Erreur lors de l'ajout de la nouvelle année"
        };
      }

    } else {

      
      // Validation avec Zod pour les données simples
      const validation = AddNewYearSchema.safeParse(formData);

      if (!validation.success) {
        return { 
          type: "error", 
          errors: validation.error.flatten().fieldErrors,
          message: "Données invalides"
        };
      }

      const validatedData = validation.data;
     

      // Appel à l'API d'ajout nouvelle année sans fichier
      const response = await createdOrUpdated({
        url: ADD_NEW_YEAR_URL,
        data: validatedData
      });


      if (response.success) {
        return {
          type: "success",
          message: response.message,
          entreprise: response.entreprise,
          resumeDividendes: response.resumeDividendes
        };
      } else {
        return {
          type: "error",
          message: response.message || "Erreur lors de l'ajout de la nouvelle année"
        };
      }
    }

  } catch (error) {
    console.error("Erreur dans addNewYearBenefices:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de l'ajout de la nouvelle année"
    };
  }
};
const DeleteUserSchema = z.object({
  userId: z.string().min(1, { message: "ID de l'utilisateur requis" })
});

export const deleteUser = async (formData) => {
  try {
 //   console.log("🗑️ Début suppression utilisateur:", formData);

    // Validation des données
    const validation = DeleteUserSchema.safeParse(formData);

    if (!validation.success) {

      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors,
        message: "Données invalides"
      };
    }

    const { userId } = validation.data;


    // Appel à l'API de suppression
    const response = await deleteWithAxios({
      url: `${DELETE_USER_URL}/${userId}`
    });

    if (response.success) {
      return {
        type: "success",
        message: response.message,
        deleted_user: response.deleted_user,
        deleted_at: response.deleted_at,
        deleted_by: response.deleted_by
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la suppression de l'utilisateur"
      };
    }

  } catch (error) {
    console.error("Erreur dans deleteUser:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de la suppression de l'utilisateur"
    };
  }
};

const CreateActionnaireSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  telephone: z.string().regex(/^[\+]?[0-9\s\-\(\)]{8,15}$/, { message: "Format de téléphone invalide" }),
  nbre_actions: z.number().min(0, { message: "Le nombre d'actions ne peut pas être négatif" })
});

/**
 * Créer un nouvel actionnaire (Admin)
 */
export const createNewActionnaire = async (formData) => {
  try {
  

    // Validation des données
    const validation = CreateActionnaireSchema.safeParse(formData);

    if (!validation.success) {
     
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors,
        message: "Données invalides"
      };
    }

    const validatedData = validation.data;
  

    // Appel à l'API de création
    const response = await createdOrUpdated({
      url: CREATE_ACTIONNAIRE_URL,
      data: validatedData
    });

  

    if (response.success) {
      return {
        type: "success",
        message: response.message,
        user: response.user,
        dividendeInfo: response.dividendeInfo
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la création de l'actionnaire"
      };
    }

  } catch (error) {
    console.error("Erreur dans createNewActionnaire:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de la création de l'actionnaire"
    };
  }
};

const UpdateUserSchema = z.object({
  userId: z.string().min(1, { message: "ID de l'utilisateur requis" }),
  firstName: z.string().min(1, { message: "Le prénom est requis" }),
  lastName: z.string().min(1, { message: "Le nom est requis" }),
  telephone: z.string().min(1, { message: "Le téléphone est requis" }),
  nbre_actions: z.number().min(0, { message: "Le nombre d'actions ne peut pas être négatif" }).optional(), // ← Optionnel
  dividende: z.number().min(0, { message: "Le dividende ne peut pas être négatif" }).optional(), // ← Optionnel
  isBlocked: z.boolean()
});

export const getAllActionnaires = async () => {
  try {
  
    const response = await fetchJSON(GET_ACTIONNAIRES_URL);

    
    if (response.success) {
      return {
        type: "success",
        data: response.actionnaires,
        statistiques: response.statistiques,
        entreprise_info: response.entreprise_info
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la récupération des actionnaires"
      };
    }
  } catch (error) {
    console.error("Erreur dans getAllActionnaires:", error);
    return {
      type: "error",
      message: error.response?.data?.message || "Erreur lors de la récupération des actionnaires"
    };
  }
};

/**
 * Récupérer ses propres actions (Actionnaire)
 */
export const getMyActions = async () => {
  try {
   
    const response = await fetchJSON(GET_MY_ACTIONS_URL);
    
    
    if (response.success) {
      return {
        type: "success",
        actions: response.actions,
        user_info: response.user_info,
        entreprise_info: response.entreprise_info
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la récupération de vos actions"
      };
    }
  } catch (error) {
    console.error("Erreur dans getMyActions:", error);
    return {
      type: "error",
      message: error.response?.data?.message || "Erreur lors de la récupération de vos actions"
    };
  }
};

/**
 * Mettre à jour les informations d'un utilisateur (Admin)
 */
export const updateUserInfo = async (formData) => {
  try {
    

    // Validation des données
    const validation = UpdateUserSchema.safeParse(formData);

    if (!validation.success) {
     
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors,
        message: "Données invalides"
      };
    }

    const validatedData = validation.data;
    

    // Appel à l'API avec PUT pour la mise à jour
    const response = await createdOrUpdated({
      url: `${UPDATE_USER_URL}/${validatedData.userId}`,
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        nbre_actions: validatedData.nbre_actions,
        isBlocked: validatedData.isBlocked,
         dividende: validatedData.dividende,
        role: 'actionnaire' // On force le rôle actionnaire
      },
      updated: true
    });

   

    if (response.success) {
      return {
        type: "success",
        message: response.message,
        user: response.user
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la mise à jour de l'utilisateur"
      };
    }

  } catch (error) {
    console.error("Erreur dans updateUserInfo:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de la mise à jour de l'utilisateur"
    };
  }
};

/**
 * Bloquer/Débloquer un actionnaire (Admin)
 */
export const toggleActionnaireStatus = async (formData) => {
  try {
 

    // Validation des données
    const validation = ToggleStatusSchema.safeParse(formData);

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
      url: TOGGLE_ACTIONNAIRE_STATUS_URL,
      data: validatedData
    });

   

    if (response.success) {
      return {
        type: "success",
        message: response.message,
        actionnaire: response.actionnaire
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors du changement de statut"
      };
    }

  } catch (error) {
    console.error("Erreur dans toggleActionnaireStatus:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors du changement de statut"
    };
  }
};

/**
 * Recalculer tous les dividendes (Admin)
 */
export const recalculateAllDividendes = async () => {
  try {


    const response = await createdOrUpdated({
      url: RECALCULATE_DIVIDENDES_URL,
      data: {}
    });


    if (response.success) {
      return {
        type: "success",
        message: response.message,
        resultats: response.resultats,
        resume: response.resume
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors du recalcul des dividendes"
      };
    }

  } catch (error) {
    console.error("Erreur dans recalculateAllDividendes:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors du recalcul des dividendes"
    };
  }
};

/**
 * Récupérer toutes les entreprises avec leurs fichiers (Admin)
 */
export const getAllEntreprisesWithFiles = async () => {
  try {

    
    const response = await fetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/api/entreprises/with-files`);
   
    
    if (response.success) {
      return {
        type: "success",
        data: response.entreprises,
        total: response.total
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la récupération des entreprises"
      };
    }
  } catch (error) {
    console.error("Erreur dans getAllEntreprisesWithFiles:", error);
    return {
      type: "error",
      message: error.response?.data?.message || "Erreur lors de la récupération des entreprises"
    };
  }
};

/**
 * Télécharger un fichier rapport (Public)
 */
export const downloadRapportFile = async (fileName) => {
  try {
 
    
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/entreprises/download/${fileName}`;
    
    // Ouvrir dans un nouvel onglet pour téléchargement
    if (typeof window !== 'undefined') {
      window.open(downloadUrl, '_blank');
      return {
        type: "success",
        message: "Téléchargement initié"
      };
    }
    
    return {
      type: "success",
      downloadUrl: downloadUrl
    };
    
  } catch (error) {
    console.error("Erreur téléchargement fichier:", error);
    return {
      type: "error",
      message: "Erreur lors du téléchargement du fichier"
    };
  }
};
const DeleteMultipleUsersSchema = z.object({
  userIds: z.array(z.string()).min(1, { message: "Au moins un ID utilisateur requis" })
});

export const deleteMultipleUsers = async (formData) => {
  try {

    const validation = DeleteMultipleUsersSchema.safeParse(formData);

    if (!validation.success) {
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors,
        message: "Données invalides"
      };
    }

    const { userIds } = validation.data;

    // Vérifier la limite (max 50)
    if (userIds.length > 50) {
      return {
        type: "error",
        message: "Impossible de supprimer plus de 50 utilisateurs à la fois"
      };
    }

    // Appel à l'API de suppression multiple
    const response = await deleteWithAxios({
      url: `${DELETE_MULTIPLE_URL}`,
      data: { userIds }
    });


    if (response.success) {
      return {
        type: "success",
        message: response.message,
        summary: response.summary,
        deleted_users: response.deleted_users,
        not_found_ids: response.not_found_ids,
        deleted_at: response.deleted_at,
        deleted_by: response.deleted_by
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la suppression multiple"
      };
    }

  } catch (error) {
    console.error("Erreur dans deleteMultipleUsers:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de la suppression multiple des utilisateurs"
    };
  }
};

