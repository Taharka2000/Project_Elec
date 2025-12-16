"use server";
import { z } from "zod";
import { createdOrUpdated } from "@/lib/api";
import { CONFIRM_WITHDRAWAL_URL, CONFIRM_WITHDRAWAL_URL_ADMIN, INITIATE_WITHDRAWAL_URL, INITIATE_WITHDRAWAL_URL_ADMIN } from "./endpoint";

// Modes de retrait valides - définir comme const assertion pour TypeScript
const validWithdrawModes = [
  "paydunya", 
  "orange-money-senegal", 
  "free-money-senegal", 
  "expresso-senegal", 
  "wave-senegal",
  "mtn-benin", 
  "moov-benin", 
  "mtn-ci", 
  "orange-money-ci", 
  "moov-ci", 
  "wave-ci",
  "t-money-togo", 
  "moov-togo", 
  "orange-money-mali", 
  "orange-money-burkina", 
  "moov-burkina-faso"
] as const;

// Type dérivé pour TypeScript
type WithdrawMode = typeof validWithdrawModes[number];

// Schéma de validation pour l'initiation du retrait - CORRIGÉ
const InitiateWithdrawalSchema = z.object({
  phoneNumber: z.string()
    .min(7, { message: "Le numéro de téléphone doit contenir au moins 7 chiffres" })
    .max(15, { message: "Le numéro de téléphone ne peut pas dépasser 15 chiffres" })
    .regex(/^\d+$/, { message: "Le numéro de téléphone ne doit contenir que des chiffres" }),
  amount: z.number().min(100, { message: "Le montant minimum est de 100 FCFA" }),
  paymentMethod: z.enum(validWithdrawModes, { message: "Méthode de paiement invalide" })
});

// Schéma de validation pour la confirmation du retrait
const ConfirmWithdrawalSchema = z.object({
  //otpCode: z.string().length(6, { message: "Le code OTP doit contenir 6 chiffres" }),
  disburse_invoice: z.string().min(1, { message: "Le token de transaction est requis" })
});

/**
 * Initier un retrait de dividendes
 */
// export const initiateDividendWithdrawal = async (formData: any) => {
//   try {
//     // Convertir les données si nécessaire
//     const processedData = {
//       ...formData,
//       amount: typeof formData.amount === 'string' ? Number(formData.amount) : formData.amount,
//     };

//     // Validation des données
//     const validation = InitiateWithdrawalSchema.safeParse(processedData);

//     if (!validation.success) {
//       return { 
//         type: "error", 
//         errors: validation.error.flatten().fieldErrors 
//       };
//     }

//     const validatedData = validation.data;

//     // Appel à l'API d'initiation en utilisant createdOrUpdated
//     const response = await createdOrUpdated({
//       url: INITIATE_WITHDRAWAL_URL,
//       data: validatedData
//     });

//     if (response.success) {
//       return {
//         type: "success",
//         message: response.message,
//         data: response.data
//       };
//     } else {
//       return {
//         type: "error",
//         message: response.message || "Erreur lors de l'initiation du retrait"
//       };
//     }

//   } catch (error: any) {
//     console.error("Erreur dans initiateDividendWithdrawal:", error);
    
//     if (error.response?.data?.message) {
//       return {
//         type: "error",
//         message: error.response.data.message
//       };
//     }
    
//     return {
//       type: "error",
//       message: "Erreur lors de l'initiation du retrait"
//     };
//   }
// };

// /**
//  * Confirmer un retrait de dividendes avec OTP
//  */
// export const confirmDividendWithdrawal = async (formData: any) => {
//   try {
//     // Validation des données
//     const validation = ConfirmWithdrawalSchema.safeParse(formData);

//     if (!validation.success) {
//       return { 
//         type: "error", 
//         errors: validation.error.flatten().fieldErrors 
//       };
//     }

//     const validatedData = validation.data;

//     try {
//       // Appel à l'API de confirmation en utilisant createdOrUpdated
//       const response = await createdOrUpdated({
//         url: CONFIRM_WITHDRAWAL_URL,
//         data: validatedData
//       });

//       if (response.success) {
//         const successResult = {
//           type: "success",
//           message: response.message,
//           data: {
//             transaction: response.transaction,
//             dividends: response.dividends
//           }
//         };
      
//         return successResult;
//       } else {
//         const errorResult = {
//           type: "error",
//           message: response.message || "Erreur lors de la confirmation du retrait"
//         };
        
//         return errorResult;
//       }

//     } catch (apiError: any) {
//       console.error("💥 Erreur API dans confirmDividendWithdrawal:", apiError);
      
//       // Vérifier si c'est une erreur 400 avec des données de réponse valides
//       if (apiError.response?.status === 400 && apiError.response?.data) {
//         const errorData = apiError.response.data;
        
//         // Cas 1: Transaction en attente (pending)
//         if (errorData.paydunya_response?.status === 'pending') {
//           const pendingResult = {
//             type: "pending",
//             message: errorData.message || "Transaction en cours de traitement. Veuillez vérifier le statut plus tard.",
//             data: {
//               status: "pending",
//               transaction_id: errorData.paydunya_response.transaction_id,
//               response_code: errorData.paydunya_response.response_code,
//               description: errorData.paydunya_response.description
//             }
//           };
        
//           return pendingResult;
//         }
        
//         // Cas 2: Transaction échouée (failed)
//         if (errorData.paydunya_response?.status === 'failed') {
//           const failedResult = {
//             type: "failed",
//             message: "Transaction échouée",
//             data: {
//               status: "failed",
//               transaction_id: errorData.paydunya_response.transaction_id,
//               response_code: errorData.paydunya_response.response_code,
//               description: errorData.paydunya_response.description,
//               reason: errorData.message
//             }
//           };
        
//           return failedResult;
//         }
        
//         // Cas 3: Code OTP expiré ou invalide
//         if (errorData.message === 'Code OTP expiré' || errorData.message?.includes('OTP')) {
//           const otpExpiredResult = {
//             type: "otp_expired",
//             message: "Code OTP expiré. Veuillez relancer le processus de retrait.",
//             data: {
//               error_type: "otp_expired"
//             }
//           };
       
//           return otpExpiredResult;
//         }
        
//         // Cas 4: Erreur de validation de requête
//         if (errorData.message?.includes('request-validation-error') || 
//             errorData.message?.includes('Request invalid')) {
//           const validationErrorResult = {
//             type: "validation_error",
//             message: "Erreur de validation. Veuillez vérifier vos informations et réessayer.",
//             data: {
//               error_type: "validation_error",
//               original_message: errorData.message
//             }
//           };
        
//           return validationErrorResult;
//         }
        
//         // Autres erreurs 400 avec message spécifique
//         const genericErrorResult = {
//           type: "error",
//           message: errorData.message || "Erreur lors de la confirmation du retrait"
//         };
      
//         return genericErrorResult;
//       }
      
//       // Autres erreurs API
//       if (apiError.response?.data?.message) {
//         const apiErrorResult = {
//           type: "error",
//           message: apiError.response.data.message
//         };
  
//         return apiErrorResult;
//       }
      
//       // Erreur générique - relancer l'erreur
//       throw apiError;
//     }

//   } catch (error: any) {
//     console.error("🚨 Erreur générale dans confirmDividendWithdrawal:", error);
    
//     const finalErrorResult = {
//       type: "error",
//       message: "Erreur lors de la confirmation du retrait"
//     };

//     return finalErrorResult;
//   }
// };

/**
 * Vérifier le statut d'une transaction
 */
export const initiateDividendWithdrawal = async (formData: any) => {
  try {
    // Convertir les données si nécessaire
    const processedData = {
      ...formData,
      amount: typeof formData.amount === 'string' ? Number(formData.amount) : formData.amount,
    };

    // Validation des données
    const validation = InitiateWithdrawalSchema.safeParse(processedData);

    if (!validation.success) {
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors 
      };
    }

    const validatedData = validation.data;

    // Appel à l'API d'initiation en utilisant createdOrUpdated
    const response = await createdOrUpdated({
      url: INITIATE_WITHDRAWAL_URL,
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
        message: response.message || "Erreur lors de l'initiation du retrait"
      };
    }

  } catch (error: any) {
    console.error("Erreur dans initiateDividendWithdrawal:", error);
    
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message
      };
    }
    
    return {
      type: "error",
      message: "Erreur lors de l'initiation du retrait"
    };
  }
};
export const initiateDividendWithdrawalAdmin = async (formData: any) => {
  try {
    // Convertir les données si nécessaire
    const processedData = {
      ...formData,
      amount: typeof formData.amount === 'string' ? Number(formData.amount) : formData.amount,
    };

    // Validation des données
    const validation = InitiateWithdrawalSchema.safeParse(processedData);

    if (!validation.success) {
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors,
        message: "Erreur de validation des données"
      };
    }

    const validatedData = validation.data;

    // Appel à l'API d'initiation en utilisant createdOrUpdated
    const response = await createdOrUpdated({
      url: INITIATE_WITHDRAWAL_URL_ADMIN,
      data: validatedData
    });
    
    //console.log('Response initiate:', response);

    if (response.success) {
      return {
        type: "success",
        message: response.message,
        data: {
          // ✅ Récupérer disburse_invoice directement depuis response
          disburse_invoice: response.data?.disburse_invoice || response.disburse_invoice,
          // Autres données potentielles
          amount: response.data?.amount || validatedData.amount,
          phoneNumber: response.data?.phoneNumber || validatedData.phoneNumber,
          paymentMethod: response.data?.paymentMethod || validatedData.paymentMethod
        }
      };
    } else {
      return {
        type: "error",
        message: response.message || "Erreur lors de l'initiation du retrait"
      };
    }

  } catch (error: any) {
    console.error("Erreur dans initiateDividendWithdrawalAdmin:", error);
    
    // Vérifier si c'est une erreur avec des détails
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Si l'API retourne des erreurs de validation spécifiques
      if (errorData.errors) {
        return {
          type: "error",
          message: errorData.message || "Erreur de validation",
          errors: errorData.errors
        };
      }
      
      // Si l'API retourne un message d'erreur simple
      if (errorData.message) {
        return {
          type: "error",
          message: errorData.message
        };
      }
    }
    
    // Erreur générique
    return {
      type: "error",
      message: "Erreur lors de l'initiation du retrait. Veuillez réessayer."
    };
  }
};
/**
 * Confirmer un retrait de dividendes (sans OTP)
 */
export const confirmDividendWithdrawal = async (formData: any) => {
  try {
    // Validation des données - seulement disburse_invoice
    if (!formData.disburse_invoice) {
      return { 
        type: "error", 
        message: "disburse_invoice requis"
      };
    } const validation = ConfirmWithdrawalSchema.safeParse(formData);
 if (!validation.success) {
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors 
      };
    }

    const validatedData = validation.data;
    try {
      // Appel à l'API de confirmation
      const response = await createdOrUpdated({
        url: CONFIRM_WITHDRAWAL_URL,
        data: validatedData
      });

      if (response.success) {
        return {
          type: "success",
          message: response.message,
          data: {
            transaction: response.transaction,
            dividends: response.dividends
          }
        };
      } else {
        return {
          type: "error",
          message: response.message || "Erreur lors de la confirmation du retrait"
        };
      }

    } catch (apiError: any) {
      console.error("💥 Erreur API dans confirmDividendWithdrawal:", apiError);
      
      // Vérifier si c'est une erreur 400 avec des données de réponse valides
      if (apiError.response?.status === 400 && apiError.response?.data) {
        const errorData = apiError.response.data;
        
        // Cas 1: Transaction en attente (pending)
        if (errorData.paydunya_response?.status === 'pending') {
          return {
            type: "pending",
            message: errorData.message || "Transaction en cours de traitement. Veuillez vérifier le statut plus tard.",
            data: {
              status: "pending",
              transaction_id: errorData.paydunya_response.transaction_id,
              response_code: errorData.paydunya_response.response_code,
              description: errorData.paydunya_response.description
            }
          };
        }
        
        // Cas 2: Transaction échouée (failed)
        if (errorData.paydunya_response?.status === 'failed') {
          return {
            type: "failed",
            message: "Transaction échouée",
            data: {
              status: "failed",
              transaction_id: errorData.paydunya_response.transaction_id,
              response_code: errorData.paydunya_response.response_code,
              description: errorData.paydunya_response.description,
              reason: errorData.message
            }
          };
        }
        
        // Cas 3: Erreur de validation de requête
        if (errorData.message?.includes('request-validation-error') || 
            errorData.message?.includes('Request invalid')) {
          return {
            type: "validation_error",
            message: "Erreur de validation. Veuillez vérifier vos informations et réessayer.",
            data: {
              error_type: "validation_error",
              original_message: errorData.message
            }
          };
        }
        
        // Autres erreurs 400 avec message spécifique
        return {
          type: "error",
          message: errorData.message || "Erreur lors de la confirmation du retrait"
        };
      }
      
      // Autres erreurs API
      if (apiError.response?.data?.message) {
        return {
          type: "error",
          message: apiError.response.data.message
        };
      }
      
      // Erreur générique - relancer l'erreur
      throw apiError;
    }

  } catch (error: any) {
    console.error("🚨 Erreur générale dans confirmDividendWithdrawal:", error);
    
    return {
      type: "error",
      message: "Erreur lors de la confirmation du retrait"
    };
  }
};
export const confirmDividendWithdrawalAdmin = async (formData: any) => {
  try {
    // Validation des données - seulement disburse_invoice
    if (!formData.disburse_invoice) {
      return { 
        type: "error", 
        message: "disburse_invoice requis"
      };
    } const validation = ConfirmWithdrawalSchema.safeParse(formData);
 if (!validation.success) {
      return { 
        type: "error", 
        errors: validation.error.flatten().fieldErrors 
      };
    }

    const validatedData = validation.data;
    try {
      // Appel à l'API de confirmation
      const response = await createdOrUpdated({
        url: CONFIRM_WITHDRAWAL_URL_ADMIN,
        data: validatedData
      });
console.log(response);

      if (response.success) {
        return {
          type: "success",
          message: response.message,
         
        };
      } else {
        return {
          type: "error",
          message: response.message || "Erreur lors de la confirmation du retrait"
        };
      }

    } catch (apiError: any) {
      console.error("💥 Erreur API dans confirmDividendWithdrawal:", apiError);
      
      // Vérifier si c'est une erreur 400 avec des données de réponse valides
      if (apiError.response?.status === 400 && apiError.response?.data) {
        const errorData = apiError.response.data;
        
        // Cas 1: Transaction en attente (pending)
        if (errorData.paydunya_response?.status === 'pending') {
          return {
            type: "pending",
            message: errorData.message || "Transaction en cours de traitement. Veuillez vérifier le statut plus tard.",
            data: {
              status: "pending",
              transaction_id: errorData.paydunya_response.transaction_id,
              response_code: errorData.paydunya_response.response_code,
              description: errorData.paydunya_response.description
            }
          };
        }
        
        // Cas 2: Transaction échouée (failed)
        if (errorData.paydunya_response?.status === 'failed') {
          return {
            type: "failed",
            message: "Transaction échouée",
            data: {
              status: "failed",
              transaction_id: errorData.paydunya_response.transaction_id,
              response_code: errorData.paydunya_response.response_code,
              description: errorData.paydunya_response.description,
              reason: errorData.message
            }
          };
        }
        
        // Cas 3: Erreur de validation de requête
        if (errorData.message?.includes('request-validation-error') || 
            errorData.message?.includes('Request invalid')) {
          return {
            type: "validation_error",
            message: "Erreur de validation. Veuillez vérifier vos informations et réessayer.",
            data: {
              error_type: "validation_error",
              original_message: errorData.message
            }
          };
        }
        
        // Autres erreurs 400 avec message spécifique
        return {
          type: "error",
          message: errorData.message || "Erreur lors de la confirmation du retrait"
        };
      }
      
      // Autres erreurs API
      if (apiError.response?.data?.message) {
        return {
          type: "error",
          message: apiError.response.data.message
        };
      }
      
      // Erreur générique - relancer l'erreur
      throw apiError;
    }

  } catch (error: any) {
    console.error("🚨 Erreur générale dans confirmDividendWithdrawal:", error);
    
    return {
      type: "error",
      message: "Erreur lors de la confirmation du retrait"
    };
  }
};
/**
 * Obtenir la liste des méthodes de paiement disponibles
 * DOIT être async pour être une Server Action valide
 */
export const getAvailablePaymentMethods = async () => {
  return validWithdrawModes.map(method => ({
    value: method,
    label: formatPaymentMethodLabel(method)
  }));
};

/**
 * Formater le label des méthodes de paiement
 */
function formatPaymentMethodLabel(method: WithdrawMode) {
  const labels: Record<WithdrawMode, string> = {
    "paydunya": "Paydunya",
    "orange-money-senegal": "Orange Money (Sénégal)",
    "free-money-senegal": "Free Money (Sénégal)",
    "expresso-senegal": "Expresso (Sénégal)",
    "wave-senegal": "Wave (Sénégal)",
    "mtn-benin": "MTN (Bénin)",
    "moov-benin": "Moov (Bénin)",
    "mtn-ci": "MTN (Côte d'Ivoire)",
    "orange-money-ci": "Orange Money (Côte d'Ivoire)",
    "moov-ci": "Moov (Côte d'Ivoire)",
    "wave-ci": "Wave (Côte d'Ivoire)",
    "t-money-togo": "T-Money (Togo)",
    "moov-togo": "Moov (Togo)",
    "orange-money-mali": "Orange Money (Mali)",
    "orange-money-burkina": "Orange Money (Burkina Faso)",
    "moov-burkina-faso": "Moov (Burkina Faso)"
  };
  
  return labels[method] || method;
}