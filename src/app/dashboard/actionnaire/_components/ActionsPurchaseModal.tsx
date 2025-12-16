import React, { useState, useTransition, useEffect } from 'react';
import { 
  ShoppingCart, 
  Calculator, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ExternalLink, 
  X,
  Plus,
  Users,
  Phone,
  Shield,
  Clock,
  RefreshCw,
  Check,
  Edit3,
  UserCheck
} from 'lucide-react';
import { initiateActionsPurchase, resendOTPForPartner } from '@/actions/buydividente';

const ActionsPurchaseModal = ({ 
  currentActions = 0, 
  currentDividends = 0,
  userInfo,
  prixUnitaire = 10000, // ✅ Prix dynamique depuis l'API
  isOpen = false,
  onClose
}) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [nombreActions, setNombreActions] = useState("");
  const [telephonePartenaire, setTelephonePartenaire] = useState("");
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isResendingOTP, startResendTransition] = useTransition();
  const [result, setResult] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [telephoneError, setTelephoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");

  // ✅ Effet pour charger automatiquement le partenaire existant
  useEffect(() => {
    if (userInfo?.telephonePartenaire && !isEditingPartner) {
      setTelephonePartenaire(userInfo.telephonePartenaire);
      console.log('📱 Partenaire existant chargé:', userInfo.telephonePartenaire);
    }
  }, [userInfo, isEditingPartner]);

  React.useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatActions = (actions) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    }).format(actions);
  };

  // ✅ Nouvelle fonction de validation pour les nombres décimaux
  const validateActions = (value) => {
    if (!value) return false;
    const num = parseFloat(value.replace(',', '.'));
    return !isNaN(num) && num > 0 && num <= 10000;
  };

  const validateTelephone = (value) => {
    if (!value) return true; // Le téléphone est optionnel
    return /^\+?[0-9]{8,15}$/.test(value);
  };

  const validateOTP = (value) => {
    return /^[0-9]{6}$/.test(value);
  };

  // ✅ Fonction modifiée pour gérer les nombres avec virgules
  const handleActionsChange = (value) => {
    // Permettre les chiffres, la virgule et le point
    const cleanValue = value.replace(/[^0-9,\.]/g, '');
    
    // Éviter les virgules/points multiples
    const parts = cleanValue.split(/[,\.]/);
    if (parts.length > 2) {
      return; // Ne pas accepter plus d'un séparateur décimal
    }
    
    // Reformater avec une virgule comme séparateur décimal
    let formattedValue = parts[0];
    if (parts.length === 2) {
      // Limiter à 3 chiffres après la virgule
      const decimals = parts[1].slice(0, 3);
      formattedValue = `${parts[0]},${decimals}`;
    }
    
    setNombreActions(formattedValue);
    setResult(null);
  };

  const handleTelephoneChange = (value) => {
    setTelephonePartenaire(value);
    setTelephoneError("");
    
    if (value && !validateTelephone(value)) {
      setTelephoneError("Format de téléphone invalide. Utilisez le format +221XXXXXXXX ou 7XXXXXXXX");
    }
    
    setResult(null);
    setShowOTPInput(false);
    setOtpCode("");
  };

  const handleOTPChange = (value) => {
    const cleanValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtpCode(cleanValue);
    setOtpError("");
    
    if (cleanValue && !validateOTP(cleanValue)) {
      setOtpError("Le code OTP doit contenir exactement 6 chiffres");
    }
  };

  const handleBackspace = () => {
    setNombreActions(prev => prev.slice(0, -1));
    setResult(null);
  };

  const handleClear = () => {
    setNombreActions("");
    setResult(null);
  };

  // ✅ Fonction pour annuler l'édition et revenir au partenaire existant
  const handleCancelEditPartner = () => {
    setIsEditingPartner(false);
    setTelephonePartenaire(userInfo?.telephonePartenaire || "");
    setTelephoneError("");
    setResult(null);
    setShowOTPInput(false);
    setOtpCode("");
  };

  const openModal = () => {
    setIsModalOpen(true);
    setNombreActions("");
    // ✅ Charger automatiquement le partenaire existant
    setTelephonePartenaire(userInfo?.telephonePartenaire || "");
    setIsEditingPartner(false);
    setOtpCode("");
    setResult(null);
    setShowConfirmation(false);
    setShowOTPInput(false);
    setTelephoneError("");
    setOtpError("");
    setPartnerPhone("");
  };

  const closeModal = () => {
    if (onClose) {
      onClose();
    } else {
      setIsModalOpen(false);
    }
    setResult(null);
    setShowConfirmation(false);
    setShowOTPInput(false);
    setTelephoneError("");
    setOtpError("");
    setIsEditingPartner(false);
  };

  const handleResendOTP = () => {
    if (!partnerPhone) return;

    startResendTransition(async () => {
      try {
        const response = await resendOTPForPartner({
          telephonePartenaire: partnerPhone
        });

        if (response.type === "success") {
          setResult({
            type: "info",
            message: `Nouveau code OTP envoyé au ${partnerPhone}`
          });
        } else {
          setResult({
            type: "error",
            message: response.message || "Erreur lors du renvoi de l'OTP"
          });
        }
      } catch (error) {
        setResult({
          type: "error",
          message: "Erreur lors du renvoi de l'OTP"
        });
      }
    });
  };

  const handlePurchase = () => {
    if (!validateActions(nombreActions)) {
      setResult({
        type: "error",
        message: "Le nombre d'actions doit être un nombre entre 0 et 10000 (décimales autorisées)"
      });
      return;
    }

    if (telephonePartenaire && !validateTelephone(telephonePartenaire)) {
      setTelephoneError("Format de téléphone invalide. Utilisez le format +221XXXXXXXX ou 7XXXXXXXX");
      return;
    }

    if (showOTPInput && (!otpCode || !validateOTP(otpCode))) {
      setOtpError("Veuillez saisir un code OTP valide à 6 chiffres");
      return;
    }

    startTransition(async () => {
      try {
        // ✅ Convertir le nombre d'actions en utilisant parseFloat et en remplaçant la virgule par un point
        const actionsNumber = parseFloat(nombreActions.replace(',', '.'));
        
        const requestData = {
          nombre_actions: actionsNumber,
          telephonePartenaire: telephonePartenaire || undefined,
        };

        // Ajouter l'OTP si nécessaire
        if (showOTPInput && otpCode) {
          requestData.otpPartenaire = otpCode;
        }

        const response = await initiateActionsPurchase(requestData);

        setResult(response);
        setShowConfirmation(false);

        if (response.type === "success" && response.data?.redirect_url) {
          setTimeout(() => {
            window.open(response.data.redirect_url, '_blank');
          }, 2000);
        } else if (response.type === "otp_required") {
          // Le serveur demande une vérification OTP
          setShowOTPInput(true);
          setPartnerPhone(response.data.partnerPhone);
          setResult({
            type: "info",
            message: response.message
          });
        }

      } catch (error) {
        setResult({
          type: "error",
          message: "Une erreur est survenue lors de l'initiation de l'achat"
        });
      }
    });
  };

  const confirmPurchase = () => {
    if (telephonePartenaire && !validateTelephone(telephonePartenaire)) {
      setTelephoneError("Format de téléphone invalide. Utilisez le format +221XXXXXXXX ou 7XXXXXXXX");
      return;
    }
    
    setShowConfirmation(true);
  };

  const PurchaseButton = () => (
    !isOpen ? (
      <button
        onClick={openModal}
        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
      >
        <Plus className="w-4 h-4 mr-2" />
        Acheter des actions
      </button>
    ) : null
  );

  // ✅ Calculer les valeurs pour l'affichage en gérant les nombres décimaux
  const actionsNumber = parseFloat(nombreActions.replace(',', '.')) || 0;
  const totalAmount = actionsNumber * prixUnitaire;

  // ✅ Détecter si c'est un partenaire existant ou nouveau
  const isExistingPartner = userInfo?.telephonePartenaire && 
                           telephonePartenaire === userInfo.telephonePartenaire && 
                           !isEditingPartner;
  const isNewPartner = telephonePartenaire && telephonePartenaire !== userInfo?.telephonePartenaire;

  if (result?.type === "success") {
    return (
      <>
        <PurchaseButton />
        {(isModalOpen || isOpen) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Commande créée avec succès !
                </h2>
                <p className="text-gray-600 mb-6">
                  Votre commande d'actions a été créée. Finalisez votre paiement pour confirmer l'achat.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Actions commandées:</span>
                      <p className="font-bold text-blue-600">
                        {formatActions(result.data?.payment_info?.nombre_actions || 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Prix unitaire:</span>
                      <p className="font-bold">
                        {formatAmount(result.data?.payment_info?.prix_unitaire || 0)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Montant total:</span>
                      <p className="font-bold text-green-600 text-lg">
                        {formatAmount(result.data?.payment_info?.montant_total || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {result.data?.redirect_url && (
                    <a
                      href={result.data.redirect_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Finaliser le paiement
                    </a>
                  )}
                  <button
                    onClick={closeModal}
                    className="w-full bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-300"
                  >
                    Fermer
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Redirection automatique vers le paiement dans quelques secondes...
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <PurchaseButton />
      {(isModalOpen || isOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="w-6 h-6 mr-2 text-blue-600" />
                Acheter des Actions  
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <Calculator className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-900">Information</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Une action coûte {formatAmount(prixUnitaire)}. Les nombres décimaux sont acceptés (ex: 1,5 actions).
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre d'actions à acheter
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nombreActions}
                      onChange={(e) => handleActionsChange(e.target.value)}
                      className="w-full p-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="0 ou 1,5"
                      disabled={isPending}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                      {nombreActions && (
                        <>
                          <button
                            onClick={handleBackspace}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Effacer le dernier chiffre"
                          >
                            ⌫
                          </button>
                          <button
                            onClick={handleClear}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Tout effacer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: 10,000 actions. Utilisez la virgule pour les décimales (ex: 1,5)
                  </p>
                </div>

                {/* ✅ Champ partenaire intelligent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-1 text-blue-600" />
                    Partenaire de parrainage
                  </label>

                  {/* ✅ Affichage du partenaire existant */}
                  {isExistingPartner && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <UserCheck className="w-5 h-5 text-green-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Partenaire actuel
                            </p>
                            <p className="text-sm text-green-600">
                              {telephonePartenaire}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        ✅ Pas d'OTP requis - Partenaire déjà vérifié
                      </p>
                    </div>
                  )}

                  {/* ✅ Champ de saisie (nouveau partenaire ou édition) */}
                  {(!isExistingPartner || isEditingPartner) && (
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-xl text-amber-600 mb-2">
                          Renseignez le numéro donné par votre parrain
                        </p>
                        <input
                          type="text"
                          value={telephonePartenaire}
                          onChange={(e) => handleTelephoneChange(e.target.value)}
                          className={`w-full p-3 pl-10 border ${telephoneError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:ring-2 focus:border-transparent`}
                          placeholder="+221 XX XXX XX XX"
                          disabled={isPending}
                        />
                        {isEditingPartner && (
                          <button
                            onClick={handleCancelEditPartner}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            title="Annuler la modification"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {telephoneError ? (
                        <p className="text-xs text-red-500 mt-1">
                          {telephoneError}
                        </p>
                      ) : (
                        <div className="mt-1">
                          {isNewPartner ? (
                            <p className="text-xs text-amber-600">
                              🆕 Nouveau partenaire - Un OTP pourrait être requis
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">
                              Ex: +221700000000 
                            </p>
                          )}
                          {isEditingPartner && (
                            <p className="text-xs text-blue-600 mt-1">
                              💡 Laissez vide pour retirer le partenaire
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Champ OTP (affiché seulement si nécessaire) */}
                {showOTPInput && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Shield className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-800">Vérification OTP</span>
                    </div>
                    <p className="text-yellow-700 text-sm mb-3">
                      Un code de vérification vous a été envoyé 
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Code de vérification (6 chiffres)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => handleOTPChange(e.target.value)}
                            className={`w-full p-3 text-center text-lg font-mono border ${otpError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:ring-2 focus:border-transparent`}
                            placeholder="000000"
                            maxLength="6"
                            disabled={isPending}
                          />
                        </div>
                        {otpError && (
                          <p className="text-xs text-red-500 mt-1">
                            {otpError}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          Code expire dans 5 minutes
                        </div>
                        <button
                          onClick={handleResendOTP}
                          disabled={isResendingOTP}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center disabled:opacity-50"
                        >
                          {isResendingOTP ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Envoi...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Renvoyer le code
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Résumé de votre achat</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actions à acheter:</span>
                      <span className="font-medium">{formatActions(actionsNumber)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix unitaire:</span>
                      <span className="font-medium">{formatAmount(prixUnitaire)}</span>
                    </div>
                    {telephonePartenaire && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bonus partenaire (10%):</span>
                        <span className="font-medium text-green-600">{formatAmount(totalAmount * 0.1)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600 font-medium">Montant total:</span>
                      <span className="font-bold text-blue-600 text-lg">{formatAmount(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {result && (result.type === "error" || result.type === "info") && (
                  <div className={`${result.type === "error" ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 flex items-center`}>
                    <AlertCircle className={`w-5 h-5 ${result.type === "error" ? 'text-red-500' : 'text-blue-500'} mr-2`} />
                    <div>
                      <span className={result.type === "error" ? 'text-red-700' : 'text-blue-700'}>{result.message}</span>
                      {result.errors && (
                        <div className="mt-2 text-sm text-red-600">
                          {Object.entries(result.errors).map(([field, messages]) => (
                            <p key={field}>
                              {Array.isArray(messages) ? messages.join(', ') : messages}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {showConfirmation && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-800">Confirmer votre achat</span>
                    </div>
                    <p className="text-yellow-700 mb-4">
                      Vous êtes sur le point d'acheter {formatActions(actionsNumber)} actions.
                      Le montant total sera {formatAmount(totalAmount)}
                      {telephonePartenaire && (
                        <>
                          <br />
                          <span className="font-medium">Partenaire:</span> {telephonePartenaire}
                          {isExistingPartner && <span className="text-green-600"> ✅ (Déjà vérifié)</span>}
                          {isNewPartner && <span className="text-amber-600"> 🆕 (Nouveau)</span>}
                          <br />
                          <span className="font-medium">Bonus partenaire:</span> {formatAmount(totalAmount * 0.1)}
                        </>
                      )}
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handlePurchase}
                        disabled={isPending}
                        className="flex-1 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          "Confirmer l'achat"
                        )}
                      </button>
                      <button
                        onClick={() => setShowConfirmation(false)}
                        disabled={isPending}
                        className="flex-1 bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {!showConfirmation && (
                  <div className="flex space-x-3">
                    <button
                      onClick={confirmPurchase}
                      disabled={!validateActions(nombreActions) || isPending || (showOTPInput && !validateOTP(otpCode))}
                      className="flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                    >
                      {showOTPInput ? 'Vérifier et acheter' : 'Procéder à l\'achat'}
                    </button>
                    <button
                      onClick={closeModal}
                      disabled={isPending}
                      className="px-6 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-300"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActionsPurchaseModal;