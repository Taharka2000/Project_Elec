// "use client";
// import React, { useState } from 'react';
// import { 
//   Share, 
//   DollarSign, 
//   User, 
//   Calendar, 
//   TrendingUp, 
//   Wallet,
//   X,
//   Phone,
//   CreditCard,
//   Download,
//   FileText,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   XCircle,
//   Info
// } from 'lucide-react';
// import { initiateDividendWithdrawal, confirmDividendWithdrawal, getAvailablePaymentMethods } from '@/actions/dividendActions';
// import { ActionsData, UserInfo, WithdrawalForm } from '@/app/Models/ActionnaireModel';

// // Types
// interface Transaction {
//   _id: string;
//   type: string;
//   amount: number;
//   userId: {
//     _id: string;
//     telephone: string;
//   };
//   recipientPhone: string;
//   paymentMethod: string;
//   status: 'completed' | 'pending' | 'failed';
//   description: string;
//   reference: string;
//   createdAt: string;
//   id_transaction?: string;
//   paydounyaTransactionId?: string;
// }

// interface ActionnaireUserViewProps {
//   actions?: ActionsData;
//   user_info?: UserInfo;
//   transactions?: Transaction[]; // Ajout des transactions en props
// }

// interface WithdrawalResponse {
//   success: boolean;
//   message: string;
//   data?: {
//     reference: string;
//     disburse_invoice: string;
//     status: string;
//   };
// }

// const ActionnaireUserViewRer: React.FC<ActionnaireUserViewProps> = ({ 
//   actions, 
//   user_info,
//   transactions: initialTransactions = [] // Transactions passées en props
// }) => {
//   const [showWithdrawModal, setShowWithdrawModal] = useState(false);
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [showTransactionsModal, setShowTransactionsModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [withdrawalData, setWithdrawalData] = useState<WithdrawalResponse['data'] | null>(null);
//   const [otpCode, setOtpCode] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [paymentMethods, setPaymentMethods] = useState<Array<{value: string, label: string}>>([]);
  
//   // Formulaire avec champ téléphone vide par défaut
//   const [formData, setFormData] = useState<WithdrawalForm>({
//     phoneNumber: '', // Champ vide - l'utilisateur doit le remplir
//     amount: '',
//     paymentMethod: 'orange-money-senegal'
//   });

//   // Vérification des données requises
//   if (!actions || !user_info) {
//     return (
//       <div className="p-6 bg-gray-50 min-h-screen">
//         <div className="bg-white rounded-lg shadow p-8 text-center">
//           <div className="text-red-500 mb-4">
//             <AlertCircle className="w-16 h-16 mx-auto" />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Données manquantes</h1>
//           <p className="text-gray-600 mb-4">
//             Impossible de charger vos informations d'actionnaire. 
//             {!user_info && " Informations utilisateur manquantes."}
//             {!actions && " Données d'actions manquantes."}
//           </p>
//           <button 
//             onClick={() => window.location.reload()} 
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Recharger la page
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Charger les méthodes de paiement au montage du composant
//   React.useEffect(() => {
//     const loadPaymentMethods = async () => {
//       try {
//         const methods = await getAvailablePaymentMethods();
//         setPaymentMethods(methods);
//       } catch (error) {
//         console.error('Erreur lors du chargement des méthodes de paiement:', error);
//         // Fallback avec méthodes par défaut
//         setPaymentMethods([
//           { value: 'orange-money-senegal', label: 'Orange Money Sénégal' },
//           { value: 'free-money-senegal', label: 'Free Money Sénégal' },
//           { value: 'wave-senegal', label: 'Wave Sénégal' }
//         ]);
//       }
//     };
    
//     loadPaymentMethods();
//   }, []);

//   // Fonction pour afficher les transactions (pas de chargement, elles sont déjà là)
//   const showTransactions = () => {
//     setShowTransactionsModal(true);
//     setError(null);
//   };

//   // Fonction pour formater les montants
//   const formatAmount = (amount: number): string => {
//     return new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: 'XOF',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   // Fonction pour formater le nombre d'actions
//   const formatActions = (actions: number): string => {
//     return new Intl.NumberFormat('fr-FR').format(actions);
//   };

//   // Fonction pour formater les dates
//   const formatDate = (dateString: string): string => {
//     return new Date(dateString).toLocaleDateString('fr-FR', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Fonction pour obtenir l'icône de statut
//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return <CheckCircle className="w-5 h-5 text-green-500" />;
//       case 'pending':
//         return <Clock className="w-5 h-5 text-yellow-500" />;
//       case 'failed':
//         return <XCircle className="w-5 h-5 text-red-500" />;
//       default:
//         return <Clock className="w-5 h-5 text-gray-500" />;
//     }
//   };

//   // Fonction pour obtenir la couleur de statut
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return 'text-green-600 bg-green-50';
//       case 'pending':
//         return 'text-yellow-600 bg-yellow-50';
//       case 'failed':
//         return 'text-red-600 bg-red-50';
//       default:
//         return 'text-gray-600 bg-gray-50';
//     }
//   };

//   // Fonction pour obtenir le label de statut
//   const getStatusLabel = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return 'Complétée';
//       case 'pending':
//         return 'En attente';
//       case 'failed':
//         return 'Échouée';
//       default:
//         return status;
//     }
//   };

//   // Fonction de validation du numéro de téléphone
//   const validatePhoneNumber = (phone: string): { isValid: boolean; message?: string } => {
//     if (!phone) {
//       return { isValid: false, message: 'Le numéro de téléphone est requis' };
//     }

//     // Nettoyer le numéro (supprimer espaces, tirets, etc.)
//     const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
//     // Vérifier s'il commence par +221 ou 221 (indicatif Sénégal)
//     if (cleanPhone.startsWith('+221') || cleanPhone.startsWith('221')) {
//       return { 
//         isValid: false, 
//         message: 'Ne pas inclure l\'indicatif du pays (+221). Saisissez uniquement le numéro local.' 
//       };
//     }

//     // Vérifier que ce sont tous des chiffres
//     if (!/^\d+$/.test(cleanPhone)) {
//       return { 
//         isValid: false, 
//         message: 'Le numéro ne doit contenir que des chiffres' 
//       };
//     }

//     // Vérifier une longueur minimum raisonnable
//     if (cleanPhone.length < 7) {
//       return { 
//         isValid: false, 
//         message: 'Le numéro semble trop court (minimum 7 chiffres)' 
//       };
//     }

//     // Vérifier une longueur maximum raisonnable
//     if (cleanPhone.length > 15) {
//       return { 
//         isValid: false, 
//         message: 'Le numéro semble trop long (maximum 15 chiffres)' 
//       };
//     }

//     return { isValid: true };
//   };

//   // Calculer la valeur par action
//   const valuePerAction = actions.nbre_actions > 0 
//     ? actions.dividende_actuel / actions.nbre_actions 
//     : 0;

//   // Gérer les changements de formulaire
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     setError(null);
//   };

//   // Initier le retrait
//   const handleInitiateWithdrawal = async () => {
//     // Validation du téléphone
//     const phoneValidation = validatePhoneNumber(formData.phoneNumber);
//     if (!phoneValidation.isValid) {
//       setError(phoneValidation.message || 'Numéro de téléphone invalide');
//       return;
//     }

//     // Validation du montant
//     if (!formData.amount) {
//       setError('Veuillez saisir un montant');
//       return;
//     }

//     const amount = parseFloat(formData.amount);
//     if (amount <= 0) {
//       setError('Le montant doit être supérieur à 0');
//       return;
//     }

//     if (amount > actions.dividende_actuel) {
//       setError(`Montant trop élevé. Maximum disponible: ${formatAmount(actions.dividende_actuel)}`);
//       return;
//     }

//     // Montant minimum (optionnel)
//     if (amount < 100) {
//       setError('Le montant minimum est de 100 FCFA');
//       return;
//     }

//     setLoading(true);
//     setError(null);
    
//     try {
//       const result = await initiateDividendWithdrawal({
//         phoneNumber: formData.phoneNumber,
//         amount: amount,
//         paymentMethod: formData.paymentMethod
//       });
      
//       if (result.type === 'success') {
//         setWithdrawalData(result.data || null);
//         setShowWithdrawModal(false);
//         setShowOtpModal(true);
//       } else {
//         setError(result.message || 'Erreur lors de l\'initiation du retrait');
//         if (result.errors) {
//           console.error('Erreurs de validation:', result.errors);
//         }
//       }
//     } catch (error) {
//       console.error('Erreur:', error);
//       setError('Erreur de connexion');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Confirmer le retrait avec OTP
//   const handleConfirmWithdrawal = async () => {
//     if (!otpCode || !withdrawalData) {
//       setError('Veuillez entrer le code OTP');
//       return;
//     }

//     setLoading(true);
//     setError(null);
    
//     try {
//       const result = await confirmDividendWithdrawal({
//         otpCode: otpCode,
//         disburse_invoice: withdrawalData.disburse_invoice
//       });
      
//       if (result.type === 'success') {
//         alert('Retrait confirmé avec succès !');
//         setShowOtpModal(false);
//         setOtpCode('');
//         setWithdrawalData(null);
//         // Recharger la page pour mettre à jour les dividendes
//         window.location.reload();
//       } else {
//         setError(result.message || 'Erreur lors de la confirmation');
//         if (result.errors) {
//           console.error('Erreurs de validation:', result.errors);
//         }
//       }
//     } catch (error) {
//       console.error('Erreur:', error);
//       setError('Erreur de connexion');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fermer les modaux
//   const closeModals = () => {
//     setShowWithdrawModal(false);
//     setShowOtpModal(false);
//     setShowTransactionsModal(false);
//     setFormData({ 
//       phoneNumber: '', // Remettre à vide
//       amount: '', 
//       paymentMethod: 'orange-money-senegal' 
//     });
//     setOtpCode('');
//     setWithdrawalData(null);
//     setError(null);
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-blue-600">Mes Actions</h1>
//         <p className="text-gray-600 mt-1">
//           Bonjour {user_info.firstName} {user_info.lastName}, voici le détail de vos actions
//         </p>
//       </div>

//       {/* Informations utilisateur */}
//       <div className="bg-white rounded-lg shadow p-6 mb-6">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//           <User className="w-5 h-5 mr-2" />
//           Informations Personnelles
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <p className="text-sm text-gray-600">Nom complet</p>
//             <p className="font-semibold">{user_info.firstName} {user_info.lastName}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Email</p>
//             <p className="font-semibold">{user_info.email}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Téléphone</p>
//             <p className="font-semibold">{user_info.telephone}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">ID Actionnaire</p>
//             <p className="font-mono text-sm">{user_info.id.slice(-8)}</p>
//           </div>
//         </div>
//       </div>

//       {/* Statistiques principales */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="p-3 rounded-full bg-blue-100">
//               <Share className="w-6 h-6 text-blue-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Nombre d'Actions</p>
//               <p className="text-3xl font-bold text-gray-900">{formatActions(actions.nbre_actions)}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="p-3 rounded-full bg-green-100">
//               <DollarSign className="w-6 h-6 text-green-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Dividende Total</p>
//               <p className="text-3xl font-bold text-gray-900">{formatAmount(actions.dividende_actuel)}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Détails des actions */}
//       <div className="bg-white rounded-lg shadow mb-6">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-900">Détail de mes Actions</h2>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full table-auto">
//             <thead>
//               <tr className="border-b border-gray-200">
//                 <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
//                   <div className="flex items-center">
//                     <Share className="w-4 h-4 mr-2" />
//                     Nombre d'Actions
//                   </div>
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
//                   <div className="flex items-center">
//                     <DollarSign className="w-4 h-4 mr-2" />
//                     Dividende Actuel
//                   </div>
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr className="hover:bg-gray-50">
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-lg font-bold text-blue-600">
//                     {formatActions(actions.nbre_actions)}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-lg font-bold text-green-600">
//                     {formatAmount(actions.dividende_actuel)}
//                   </div>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Résumé et actions */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">Résumé</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-700 mb-3">Votre Participation</h3>
//             <div className="space-y-3">
//               <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
//                 <span className="text-gray-600">Actions détenues</span>
//                 <span className="font-bold text-blue-600">{formatActions(actions.nbre_actions)}</span>
//               </div>
//               <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
//                 <span className="text-gray-600">Dividendes disponibles</span>
//                 <span className="font-bold text-green-600">{formatAmount(actions.dividende_actuel)}</span>
//               </div>
//             </div>
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-gray-700 mb-3">Actions Disponibles</h3>
//             <div className="space-y-2">
//               <button 
//                 onClick={() => setShowWithdrawModal(true)}
//                 disabled={actions.dividende_actuel <= 0}
//                 className="w-full flex items-center justify-start px-4 py-3 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <Wallet className="w-4 h-4 mr-2" />
//                 Retirer des dividendes ({formatAmount(actions.dividende_actuel)})
//               </button>
//               <button 
//                 onClick={showTransactions}
//                 className="w-full flex items-center justify-start px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded border border-gray-200 transition-colors"
//               >
//                 <FileText className="w-4 h-4 mr-2" />
//                 Historique des transactions ({initialTransactions.length})
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//hjjhjhjhjhj
//       {/* Modal de retrait */}
//       {showWithdrawModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold text-gray-900">Retirer des dividendes</h2>
//               <button 
//                 onClick={closeModals}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="mb-4">
//               <p className="text-sm text-gray-600 mb-2">
//                 Dividendes disponibles: <span className="font-bold text-green-600">
//                   {formatAmount(actions.dividende_actuel)}
//                 </span>
//               </p>
              
//               {/* Alerte informative */}
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
//                 <div className="flex items-start">
//                   <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
//                   <div className="text-sm text-blue-700">
//                     <p className="font-medium mb-1">Important :</p>
//                     <p>Saisissez votre numéro de téléphone sans l'indicatif du pays (+221).</p>
//                     <p className="mt-1 text-xs">Exemple : 771234567 (et non +221771234567)</p>
//                   </div>
//                 </div>
//               </div>

//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
//                   <div className="flex items-start">
//                     <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
//                     <p className="text-red-600 text-sm">{error}</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="space-y-4">
//               {/* Numéro de téléphone */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Numéro de téléphone
//                 </label>
//                 <div className="relative">
//                   <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                   <input
//                     type="tel"
//                     name="phoneNumber"
//                     value={formData.phoneNumber}
//                     onChange={handleInputChange}
//                     placeholder="771234567"
//                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Saisissez le numéro sans l'indicatif du pays (+221)
//                 </p>
//               </div>

//               {/* Montant */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Montant à retirer (FCFA)
//                 </label>
//                 <input
//                   type="number"
//                   name="amount"
//                   value={formData.amount}
//                   onChange={handleInputChange}
//                   max={actions.dividende_actuel}
//                   min="100"
//                   placeholder="Entrez le montant (min. 100 FCFA)"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Montant minimum : 100 FCFA
//                 </p>
//               </div>

//               {/* Méthode de paiement */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Méthode de paiement
//                 </label>
//                 <div className="relative">
//                   <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                   <select
//                     name="paymentMethod"
//                     value={formData.paymentMethod}
//                     onChange={handleInputChange}
//                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     {paymentMethods.map((method) => (
//                       <option key={method.value} value={method.value}>
//                         {method.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             <div className="flex space-x-3 mt-6">
//               <button
//                 onClick={closeModals}
//                 className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//               >
//                 Annuler
//               </button>
//               <button
//                 onClick={handleInitiateWithdrawal}
//                 disabled={loading}
//                 className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
//               >
//                 {loading ? 'Traitement...' : 'Continuer'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal OTP */}
//       {showOtpModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold text-gray-900">Confirmer le retrait</h2>
//               <button 
//                 onClick={closeModals}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Phone className="w-8 h-8 text-blue-500" />
//               </div>
//               <p className="text-gray-600">
//                 Un code de vérification a été envoyé à votre numéro WhatsApp
//               </p>
//               {withdrawalData && (
//                 <p className="text-sm text-gray-500 mt-2">
//                   Référence: {withdrawalData.reference}
//                 </p>
//               )}
//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
//                   <p className="text-red-600 text-sm">{error}</p>
//                 </div>
//               )}
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Code de vérification
//                 </label>
//                 <input
//                   type="text"
//                   value={otpCode}
//                   onChange={(e) => setOtpCode(e.target.value)}
//                   placeholder="Entrez le code à 6 chiffres"
//                   maxLength={6}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
//                 />
//               </div>
//             </div>

//             <div className="flex space-x-3 mt-6">
//               <button
//                 onClick={closeModals}
//                 className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//               >
//                 Annuler
//               </button>
//               <button
//                 onClick={handleConfirmWithdrawal}
//                 disabled={loading || otpCode.length !== 6}
//                 className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
//               >
//                 {loading ? 'Confirmation...' : 'Confirmer'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal des transactions */}
//       {showTransactionsModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
//             {/* Header du modal */}
//             <div className="flex justify-between items-center p-6 border-b border-gray-200">
//               <div className="flex items-center">
//                 <FileText className="w-6 h-6 text-blue-600 mr-2" />
//                 <h2 className="text-xl font-bold text-gray-900">Historique des transactions</h2>
//               </div>
//               <button 
//                 onClick={closeModals}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             {/* Contenu du modal */}
//             <div className="flex-1 overflow-y-auto p-6">
//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
//                   <p className="text-red-600 text-sm">{error}</p>
//                 </div>
//               )}

//               {initialTransactions.length === 0 ? (
//                 <div className="text-center py-8">
//                   <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune transaction</h3>
//                   <p className="text-gray-500">Vous n'avez encore effectué aucune transaction.</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {initialTransactions.map((transaction) => (
//                     <div key={transaction._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <div className="flex items-center mb-2">
//                             {getStatusIcon(transaction.status)}
//                             <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
//                               {getStatusLabel(transaction.status)}
//                             </span>
//                             <span className="ml-auto text-lg font-bold text-gray-900">
//                               {formatAmount(transaction.amount)}
//                             </span>
//                           </div>
                          
//                           <h4 className="font-semibold text-gray-900 mb-1">
//                             {transaction.description}
//                           </h4>
                          
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
//                             <div>
//                               <span className="font-medium">Référence:</span> {transaction.reference}
//                             </div>
//                             <div>
//                               <span className="font-medium">Téléphone:</span> {transaction.recipientPhone}
//                             </div>
//                             <div>
//                               <span className="font-medium">Méthode:</span> {transaction.paymentMethod}
//                             </div>
//                             <div>
//                               <span className="font-medium">Date:</span> {formatDate(transaction.createdAt)}
//                             </div>
//                             {transaction.id_transaction && (
//                               <div className="md:col-span-2">
//                                 <span className="font-medium">ID Transaction:</span> 
//                                 <span className="font-mono text-xs ml-1">{transaction.id_transaction}</span>
//                               </div>
//                             )}
//                             {transaction.paydounyaTransactionId && (
//                               <div className="md:col-span-2">
//                                 <span className="font-medium">ID Paydunya:</span> 
//                                 <span className="font-mono text-xs ml-1">{transaction.paydounyaTransactionId}</span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Footer du modal */}
//             {initialTransactions.length > 0 && (
//               <div className="border-t border-gray-200 p-6 bg-gray-50">
//                 <div className="flex justify-between items-center">
//                   <div className="text-sm text-gray-600">
//                     Total: {initialTransactions.length} transaction(s)
//                   </div>
//                   <button
//                     onClick={() => {
//                       // Fonction pour exporter en CSV
//                       const csvContent = [
//                         ['Date', 'Référence', 'Description', 'Montant', 'Statut', 'Téléphone', 'Méthode'].join(','),
//                         ...initialTransactions.map(t => [
//                           new Date(t.createdAt).toLocaleDateString('fr-FR'),
//                           t.reference,
//                           `"${t.description}"`,
//                           t.amount,
//                           getStatusLabel(t.status),
//                           t.recipientPhone,
//                           t.paymentMethod
//                         ].join(','))
//                       ].join('\n');

//                       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//                       const link = document.createElement('a');
//                       link.href = URL.createObjectURL(blob);
//                       link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
//                       link.click();
//                     }}
//                     className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     <Download className="w-4 h-4 mr-2" />
//                     Exporter CSV
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ActionnaireUserViewRer;


"use client";
import React, { useState } from 'react';
import { 
  Share, 
  DollarSign, 
  User, 
  Calendar, 
  TrendingUp, 
  Wallet,
  X,
  Phone,
  CreditCard,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Info
} from 'lucide-react';
import { initiateDividendWithdrawal, getAvailablePaymentMethods } from '@/actions/dividendActions';
import { ActionsData, UserInfo, WithdrawalForm } from '@/app/Models/ActionnaireModel';

// Types
interface Transaction {
  _id: string;
  type: string;
  amount: number;
  userId: {
    _id: string;
    telephone: string;
  };
  recipientPhone: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  reference: string;
  createdAt: string;
  id_transaction?: string;
  paydounyaTransactionId?: string;
}

interface ActionnaireUserViewProps {
  actions?: ActionsData;
  user_info?: UserInfo;
  transactions?: Transaction[];
}

const ActionnaireUserViewRer: React.FC<ActionnaireUserViewProps> = ({ 
  actions, 
  user_info,
  transactions: initialTransactions = []
}) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Array<{value: string, label: string}>>([]);
  
  // Formulaire avec champ téléphone vide par défaut
  const [formData, setFormData] = useState<WithdrawalForm>({
    phoneNumber: '',
    amount: '',
    paymentMethod: 'orange-money-senegal'
  });

  // Vérification des données requises
  if (!actions || !user_info) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Données manquantes</h1>
          <p className="text-gray-600 mb-4">
            Impossible de charger vos informations d'actionnaire. 
            {!user_info && " Informations utilisateur manquantes."}
            {!actions && " Données d'actions manquantes."}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  // Charger les méthodes de paiement au montage du composant
  React.useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const methods = await getAvailablePaymentMethods();
        setPaymentMethods(methods);
      } catch (error) {
        console.error('Erreur lors du chargement des méthodes de paiement:', error);
        setPaymentMethods([
          { value: 'orange-money-senegal', label: 'Orange Money Sénégal' },
          { value: 'free-money-senegal', label: 'Free Money Sénégal' },
          { value: 'wave-senegal', label: 'Wave Sénégal' }
        ]);
      }
    };
    
    loadPaymentMethods();
  }, []);

  // Fonction pour afficher les transactions
  const showTransactions = () => {
    setShowTransactionsModal(true);
    setError(null);
  };

  // Fonction pour formater les montants
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fonction pour formater le nombre d'actions
  const formatActions = (actions: number): string => {
    return new Intl.NumberFormat('fr-FR').format(actions);
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Fonction pour obtenir le label de statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complétée';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échouée';
      default:
        return status;
    }
  };

  // Fonction de validation du numéro de téléphone
  const validatePhoneNumber = (phone: string): { isValid: boolean; message?: string } => {
    if (!phone) {
      return { isValid: false, message: 'Le numéro de téléphone est requis' };
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (cleanPhone.startsWith('+221') || cleanPhone.startsWith('221')) {
      return { 
        isValid: false, 
        message: 'Ne pas inclure l\'indicatif du pays (+221). Saisissez uniquement le numéro local.' 
      };
    }

    if (!/^\d+$/.test(cleanPhone)) {
      return { 
        isValid: false, 
        message: 'Le numéro ne doit contenir que des chiffres' 
      };
    }

    if (cleanPhone.length < 7) {
      return { 
        isValid: false, 
        message: 'Le numéro semble trop court (minimum 7 chiffres)' 
      };
    }

    if (cleanPhone.length > 15) {
      return { 
        isValid: false, 
        message: 'Le numéro semble trop long (maximum 15 chiffres)' 
      };
    }

    return { isValid: true };
  };

  // Calculer la valeur par action
  const valuePerAction = actions.nbre_actions > 0 
    ? actions.dividende_actuel / actions.nbre_actions 
    : 0;

  // Gérer les changements de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  // Initier le retrait (traitement direct sans OTP)
  const handleWithdrawal = async () => {
    // Validation du téléphone
    const phoneValidation = validatePhoneNumber(formData.phoneNumber);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.message || 'Numéro de téléphone invalide');
      return;
    }

    // Validation du montant
    if (!formData.amount) {
      setError('Veuillez saisir un montant');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      setError('Le montant doit être supérieur à 0');
      return;
    }

    if (amount > actions.dividende_actuel) {
      setError(`Montant trop élevé. Maximum disponible: ${formatAmount(actions.dividende_actuel)}`);
      return;
    }

    if (amount < 100) {
      setError('Le montant minimum est de 100 FCFA');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await initiateDividendWithdrawal({
        phoneNumber: formData.phoneNumber,
        amount: amount,
        paymentMethod: formData.paymentMethod
      });
      
      if (result.type === 'success') {
        alert('Retrait effectué avec succès !');
        setShowWithdrawModal(false);
        // Recharger la page pour mettre à jour les dividendes
        window.location.reload();
      } else {
        setError(result.message || 'Erreur lors du retrait');
        if (result.errors) {
          console.error('Erreurs de validation:', result.errors);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Fermer les modaux
  const closeModals = () => {
    setShowWithdrawModal(false);
    setShowTransactionsModal(false);
    setFormData({ 
      phoneNumber: '',
      amount: '', 
      paymentMethod: 'orange-money-senegal' 
    });
    setError(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Mes Actions</h1>
        <p className="text-gray-600 mt-1">
          Bonjour {user_info.firstName} {user_info.lastName}, voici le détail de vos actions
        </p>
      </div>

      {/* Informations utilisateur */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Informations Personnelles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nom complet</p>
            <p className="font-semibold">{user_info.firstName} {user_info.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">{user_info.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Téléphone</p>
            <p className="font-semibold">{user_info.telephone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ID Actionnaire</p>
            <p className="font-mono text-sm">{user_info.id.slice(-8)}</p>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Share className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nombre d'Actions</p>
              <p className="text-3xl font-bold text-gray-900">{formatActions(actions.nbre_actions)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dividende Total</p>
              <p className="text-3xl font-bold text-gray-900">{formatAmount(actions.dividende_actuel)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Détails des actions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Détail de mes Actions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
                  <div className="flex items-center">
                    <Share className="w-4 h-4 mr-2" />
                    Nombre d'Actions
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Dividende Actuel
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-bold text-blue-600">
                    {formatActions(actions.nbre_actions)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-bold text-green-600">
                    {formatAmount(actions.dividende_actuel)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Résumé et actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Résumé</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Votre Participation</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Actions détenues</span>
                <span className="font-bold text-blue-600">{formatActions(actions.nbre_actions)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Dividendes disponibles</span>
                <span className="font-bold text-green-600">{formatAmount(actions.dividende_actuel)}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Actions Disponibles</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setShowWithdrawModal(true)}
                disabled={actions.dividende_actuel <= 0}
                className="w-full flex items-center justify-start px-4 py-3 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Retirer des dividendes ({formatAmount(actions.dividende_actuel)})
              </button>
              <button 
                onClick={showTransactions}
                className="w-full flex items-center justify-start px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded border border-gray-200 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                Historique des transactions ({initialTransactions.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de retrait */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Retirer des dividendes</h2>
              <button 
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Dividendes disponibles: <span className="font-bold text-green-600">
                  {formatAmount(actions.dividende_actuel)}
                </span>
              </p>
              
              {/* Alerte informative */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Important :</p>
                    <p>Saisissez votre numéro de téléphone sans l'indicatif du pays (+221).</p>
                    <p className="mt-1 text-xs">Exemple : 771234567 (et non +221771234567)</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
{/* //tes */}
            <div className="space-y-4">
              {/* Numéro de téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="771234567"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Saisissez le numéro sans l'indicatif du pays (+221)
                </p>
              </div>

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant à retirer (FCFA)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  max={actions.dividende_actuel}
                  min="100"
                  placeholder="Entrez le montant (min. 100 FCFA)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Montant minimum : 100 FCFA
                </p>
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Méthode de paiement
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeModals}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleWithdrawal}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Traitement...' : 'Confirmer le retrait'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal des transactions */}
      {showTransactionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Historique des transactions</h2>
              </div>
              <button 
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {initialTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune transaction</h3>
                  <p className="text-gray-500">Vous n'avez encore effectué aucune transaction.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {initialTransactions.map((transaction) => (
                    <div key={transaction._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {getStatusIcon(transaction.status)}
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {getStatusLabel(transaction.status)}
                            </span>
                            <span className="ml-auto text-lg font-bold text-gray-900">
                              {formatAmount(transaction.amount)}
                            </span>
                          </div>
                          
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {transaction.description}
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Référence:</span> {transaction.reference}
                            </div>
                            <div>
                              <span className="font-medium">Téléphone:</span> {transaction.recipientPhone}
                            </div>
                            <div>
                              <span className="font-medium">Méthode:</span> {transaction.paymentMethod}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span> {formatDate(transaction.createdAt)}
                            </div>
                            {transaction.id_transaction && (
                              <div className="md:col-span-2">
                                <span className="font-medium">ID Transaction:</span> 
                                <span className="font-mono text-xs ml-1">{transaction.id_transaction}</span>
                              </div>
                            )}
                            {transaction.paydounyaTransactionId && (
                              <div className="md:col-span-2">
                                <span className="font-medium">ID Paydunya:</span> 
                                <span className="font-mono text-xs ml-1">{transaction.paydounyaTransactionId}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {initialTransactions.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Total: {initialTransactions.length} transaction(s)
                  </div>
                  <button
                    onClick={() => {
                      const csvContent = [
                        ['Date', 'Référence', 'Description', 'Montant', 'Statut', 'Téléphone', 'Méthode'].join(','),
                        ...initialTransactions.map(t => [
                          new Date(t.createdAt).toLocaleDateString('fr-FR'),
                          t.reference,
                          `"${t.description}"`,
                          t.amount,
                          getStatusLabel(t.status),
                          t.recipientPhone,
                          t.paymentMethod
                        ].join(','))
                      ].join('\n');

                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
                      link.click();
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionnaireUserViewRer;