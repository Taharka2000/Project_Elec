"use server";
import { z } from "zod";
import { createdOrUpdated, fetchJSON } from "@/lib/api";
import { 
  ADD_PROJECTION_URL,
  GET_PROJECTIONS_URL,
  PROJECT_FUTURE_URL,
  UPDATE_PROJECTION_URL,
  DELETE_PROJECTION_URL
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

// Schémas de validation
const AddProjectionSchema = z.object({
  users: z.number().min(1, { message: "Le nombre d'utilisateurs doit être supérieur à 0" }),
  revenue: z.number().min(1, { message: "Le chiffre d'affaires doit être supérieur à 0" }),
  expenses: z.number().min(0, { message: "Les dépenses ne peuvent pas être négatives" }),
  shares: z.number().min(1, { message: "Le nombre d'actions doit être supérieur à 0" })
});

const ProjectFutureSchema = z.object({
  fromYear: z.number().min(2020).max(2100, { message: "Année de référence invalide" }),
  toYear: z.number().min(2020).max(2100, { message: "Année cible invalide" }),
  projectedUsers: z.number().min(1, { message: "Le nombre d'utilisateurs projetés doit être supérieur à 0" })
});

const UpdateProjectionSchema = z.object({
  projectionId: z.string().min(1, { message: "ID de la projection requis" }),
  users: z.number().min(1, { message: "Le nombre d'utilisateurs doit être supérieur à 0" }),
  revenue: z.number().min(1, { message: "Le chiffre d'affaires doit être supérieur à 0" }),
  expenses: z.number().min(0, { message: "Les dépenses ne peuvent pas être négatives" }),
  shares: z.number().min(1, { message: "Le nombre d'actions doit être supérieur à 0" })
});

/**
 * Ajouter une nouvelle projection (Admin)
 */
export const addProjection = async (formData: any) => {
  try {
   

    // Validation des données
    const validation = AddProjectionSchema.safeParse(formData);

    if (!validation.success) {
     
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors,
        message: "Données invalides"
      };
    }

    const validatedData = validation.data;
 

    // Appel à l'API d'ajout de projection
    const response = await createdOrUpdated({
      url: ADD_PROJECTION_URL,
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
        message: response.message || "Erreur lors de l'ajout de la projection"
      };
    }

  } catch (error) {
    console.error("Erreur dans addProjection:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de l'ajout de la projection"
    };
  }
};

/**
 * Récupérer toutes les projections (Admin)
 */
export const getAllProjections = async () => {
  try {
    const response = await fetchJSON(GET_PROJECTIONS_URL);

    
    if (Array.isArray(response)) {
      // Si la réponse est directement un array
      const { calculateProjectionStats } = await import('@/lib/projectionUtils');
      return {
        type: "success",
        data: response,
        projections: response,
        statistiques: calculateProjectionStats(response)
      };
    } else if (response.success) {
      // Si la réponse a une structure avec success
      const projections = response.projections || response.data || [];
      const { calculateProjectionStats } = await import('@/lib/projectionUtils');
      return {
        type: "success",
        data: projections,
        projections: projections,
        statistiques: response.statistiques || calculateProjectionStats(projections)
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la récupération des projections"
      };
    }
  } catch (error) {
    console.error("Erreur dans getAllProjections:", error);
    return {
      type: "error",
      message: error.response?.data?.message || "Erreur lors de la récupération des projections"
    };
  }
};

/**
 * Créer une projection future (Admin)
 */
export const projectFuture = async (formData: any) => {
  try {
 

    // Validation des données
    const validation = ProjectFutureSchema.safeParse(formData);

    if (!validation.success) {
     
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors,
        message: "Données invalides"
      };
    }

    const validatedData = validation.data;
    
    // Validation supplémentaire
    if (validatedData.toYear <= validatedData.fromYear) {
      return {
        type: "error",
        message: "L'année cible doit être postérieure à l'année de référence"
      };
    }

   

    // Appel à l'API de projection future
    const response = await createdOrUpdated({
      url: PROJECT_FUTURE_URL,
      data: validatedData
    });

  

    if (response.success) {
      return {
        type: "success",
        message: response.message,
        data: response,
        projectionResult: response
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la création de la projection future"
      };
    }

  } catch (error) {
    console.error("Erreur dans projectFuture:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de la création de la projection future"
    };
  }
};

/**
 * Mettre à jour une projection (Admin)
 */
export const updateProjection = async (formData: any) => {
  try {
  

    // Validation des données
    const validation = UpdateProjectionSchema.safeParse(formData);

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
      url: `${UPDATE_PROJECTION_URL}/${validatedData.projectionId}`,
      data: {
        users: validatedData.users,
        revenue: validatedData.revenue,
        expenses: validatedData.expenses,
        shares: validatedData.shares
      },
      updated: true
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
        message: response.message || "Erreur lors de la mise à jour de la projection"
      };
    }

  } catch (error) {
    console.error("Erreur dans updateProjection:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de la mise à jour de la projection"
    };
  }
};

/**
 * Supprimer une projection (Admin)
 */
export const deleteProjection = async (projectionId: string) => {
  try {
   
    if (!projectionId) {
      return {
        type: "error",
        message: "ID de la projection requis"
      };
    }

    // Appel à l'API avec DELETE
    const response = await createdOrUpdated({
      url: `${DELETE_PROJECTION_URL}/${projectionId}`,
      data: {},
      method: 'DELETE'
    });

   

    if (response.success) {
      return {
        type: "success",
        message: response.message || "Projection supprimée avec succès"
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la suppression de la projection"
      };
    }

  } catch (error) {
    console.error("Erreur dans deleteProjection:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de la suppression de la projection"
    };
  }
};

/**
 * Exporter les projections en CSV (Admin)
 */
export const exportProjectionsToCSV = async (projections: any[]) => {
  try {
    
    
    if (!Array.isArray(projections) || projections.length === 0) {
      return {
        type: "error",
        message: "Aucune projection à exporter"
      };
    }

    // Import des utilitaires côté serveur
    const { prepareCsvData } = await import('@/lib/projectionUtils');
    const csvData = prepareCsvData(projections);

    return {
      type: "success",
      message: "Export CSV préparé avec succès",
      data: {
        content: csvData.content,
        filename: csvData.filename,
        mimeType: 'text/csv'
      }
    };

  } catch (error) {
    console.error("Erreur export CSV:", error);
    return {
      type: "error",
      message: "Erreur lors de l'export CSV"
    };
  }
};

/**
 * Récupérer toutes les projections avec leurs fichiers (Admin)
 */
export const getAllProjectionsWithFiles = async () => {
  try {
   
    
    const response = await fetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/api/projections/with-files`);
  
    
    if (response.success) {
      return {
        type: "success",
        data: response.projections,
        total: response.total
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de la récupération des projections"
      };
    }
  } catch (error) {
    console.error("Erreur dans getAllProjectionsWithFiles:", error);
    return {
      type: "error",
      message: error.response?.data?.message || "Erreur lors de la récupération des projections"
    };
  }
};

/**
 * Télécharger un fichier rapport de projection (Public)
 */
export const downloadProjectionFile = async (fileName: string) => {
  try {

    
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/projections/download/${fileName}`;
    
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
    console.error("Erreur téléchargement fichier projection:", error);
    return {
      type: "error",
      message: "Erreur lors du téléchargement du fichier"
    };
  }
};