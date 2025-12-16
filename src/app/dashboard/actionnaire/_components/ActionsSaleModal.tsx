"use client";
import React, { useState, useTransition } from 'react';
import { 
  Calculator, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  X,
  DollarSign,
  Building2,
  Users
} from 'lucide-react';
import { initiateActionsSale, sellActionsBetweenUser } from '@/actions/buydividente';

interface ActionsSaleModalProps {
  currentActions?: number;
  currentDividends?: number;
  userInfo?: {
    firstName: string;
    lastName: string;
    telephone: string;
  };
  isOpen?: boolean;
  onClose?: () => void;
  onSaleSuccess?: () => void;
}

interface SaleResponse {
  type: "success" | "error";
  message: string;
  data?: {
    demande?: {
      id: string;
      nombre_actions: number;
      prix_unitaire: number;
      montant_total: number;
      status: string;
      date_demande: string;
      actions_restantes_apres_vente: number;
    };
  };
  errors?: any;
}

const ActionsSaleModal: React.FC<ActionsSaleModalProps> = ({ 
  currentActions = 0, 
  currentDividends = 0,
  userInfo,
  isOpen = false,
  onClose,
  onSaleSuccess
}) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [saleType, setSaleType] = useState<'company' | 'user'>('company');
  const [nombreActions, setNombreActions] = useState<string>("");
  const [telephoneAcheteur, setTelephoneAcheteur] = useState<string>("");
  const [montant, setMontant] = useState<string>("");
  const [motif, setMotif] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SaleResponse | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  React.useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatActions = (actions: number): string => {
    return new Intl.NumberFormat('fr-FR').format(actions);
  };

  const PRIX_VENTE_ACTION = 4500;

  const validateActions = (value: string): boolean => {
    if (!value) return false;
    const num = parseInt(value);
    return !isNaN(num) && num > 0 && num <= currentActions && Number.isInteger(num);
  };

  const handleActionsChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    setNombreActions(cleanValue);
    setResult(null);
  };

  const handleMotifChange = (value: string) => {
    setMotif(value);
  };

  const handleBackspace = () => {
    setNombreActions(prev => prev.slice(0, -1));
    setResult(null);
  };

  const handleClear = () => {
    setNombreActions("");
    setTelephoneAcheteur("");
    setMontant("");
    setResult(null);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setNombreActions("");
    setTelephoneAcheteur("");
    setMontant("");
    setMotif("");
    setSaleType('company');
    setResult(null);
    setShowConfirmation(false);
  };

  const closeModal = () => {
    if (onClose) {
      onClose();
    } else {
      setIsModalOpen(false);
    }
    setResult(null);
    setShowConfirmation(false);
  };

  const handleSale = () => {
    startTransition(async () => {
      try {
        let response;
        
        if (saleType === 'company') {
          // Vente à l'entreprise
          response = await initiateActionsSale({
            nombre_actions: parseInt(nombreActions),
            motif: motif || "Vente d'actions"
          });
        } else {
          // Vente entre utilisateurs
          response = await sellActionsBetweenUser({
            nbre_actions: parseInt(nombreActions),
            telephone: telephoneAcheteur,
            montant: parseFloat(montant)
          });
        }
console.log(response);

        setResult(response);
        setShowConfirmation(false);
        
        // Si la vente est réussie, appeler le callback et rafraîchir après un délai
        if (response.type === 'success') {
          setTimeout(() => {
            if (onSaleSuccess) {
              onSaleSuccess();
            } else {
              // Rafraîchir la page si aucun callback n'est fourni
              window.location.reload();
            }
          }, 3000); // Attendre 3 secondes pour que l'utilisateur voie le message de succès
        }
      } catch (error) {
        setResult({
          type: "error",
          message: "Une erreur est survenue lors de la demande de vente"
        });
      }
    });
  };

  const validateUserSale = (): boolean => {
    if (!validateActions(nombreActions)) return false;
    if (!telephoneAcheteur.trim()) return false;
    if (!montant.trim() || parseFloat(montant) <= 0) return false;
    return true;
  };

  const confirmSale = () => {
    // Validation selon le type de vente
    if (saleType === 'company') {
      if (!validateActions(nombreActions)) {
        setResult({
          type: "error",
          message: `Le nombre d'actions doit être un nombre entier entre 1 et ${currentActions}`
        });
        return;
      }
    } else {
      // Vente entre utilisateurs
      if (!validateActions(nombreActions)) {
        setResult({
          type: "error",
          message: `Le nombre d'actions doit être un nombre entier entre 1 et ${currentActions}`
        });
        return;
      }
      if (!telephoneAcheteur.trim()) {
        setResult({
          type: "error",
          message: "Veuillez saisir le téléphone de l'acheteur"
        });
        return;
      }
      if (!montant.trim() || parseFloat(montant) <= 0) {
        setResult({
          type: "error",
          message: "Veuillez saisir un montant valide"
        });
        return;
      }
    }
    
    setShowConfirmation(true);
  };

  const SaleButton = () => (
    <button
      onClick={openModal}
      className="bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center"
    >
      <DollarSign className="w-4 h-4 mr-2" />
      Vendre mes actions
    </button>
  );

  const actionsNumber = parseInt(nombreActions) || 0;
  const totalAmount = saleType === 'company' 
    ? actionsNumber * PRIX_VENTE_ACTION 
    : parseFloat(montant) || 0;

  if (result?.type === "success") {
    return (
      <>
        <SaleButton />
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {saleType === 'company' ? 'Demande envoyée avec succès !' : 'Transaction réussie !'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {saleType === 'company' 
                    ? "Votre demande de vente d'actions a été créée. L'administrateur examinera votre demande et vous recevrez une notification dès qu'elle sera traitée."
                    : result.message
                  }
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Actions {saleType === 'company' ? 'à vendre' : 'vendues'}:</span>
                      <p className="font-bold text-blue-600">
                        {formatActions(result.data?.demande?.nombre_actions || 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Prix unitaire:</span>
                      <p className="font-bold">
                        {formatAmount(result.data?.demande?.prix_unitaire || 0)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Montant total:</span>
                      <p className="font-bold text-green-600 text-lg">
                        {formatAmount(result.data?.demande?.montant_total || 0)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Actions restantes après vente:</span>
                      <p className="font-bold text-blue-600">
                        {formatActions(result.data?.demande?.actions_restantes_apres_vente || 0)}
                      </p>
                    </div>
                    {saleType === 'user' && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Acheteur:</span>
                        <p className="font-medium">{telephoneAcheteur}</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300"
                >
                  Fermer (actualisation automatique...)
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <SaleButton />
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-green-600" />
                Vendre mes Actions
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Toggle pour choisir le type de vente */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type de vente
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSaleType('company')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      saleType === 'company'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className={`w-6 h-6 mx-auto mb-2 ${
                      saleType === 'company' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      saleType === 'company' ? 'text-green-900' : 'text-gray-600'
                    }`}>
                      À l'entreprise
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatAmount(PRIX_VENTE_ACTION)}/action
                    </p>
                  </button>

                  <button
                    onClick={() => setSaleType('user')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      saleType === 'user'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Users className={`w-6 h-6 mx-auto mb-2 ${
                      saleType === 'user' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      saleType === 'user' ? 'text-blue-900' : 'text-gray-600'
                    }`}>
                      À un utilisateur
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Prix libre
                    </p>
                  </button>
                </div>
              </div>

              <div className={`rounded-lg p-4 mb-6 ${
                saleType === 'company' ? 'bg-green-50' : 'bg-blue-50'
              }`}>
                <div className="flex items-center mb-2">
                  <Calculator className={`w-5 h-5 mr-2 ${
                    saleType === 'company' ? 'text-green-600' : 'text-blue-600'
                  }`} />
                  <span className={`font-semibold ${
                    saleType === 'company' ? 'text-green-900' : 'text-blue-900'
                  }`}>
                    Information
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {saleType === 'company' 
                    ? `Le prix de vente est fixé à ${formatAmount(PRIX_VENTE_ACTION)} par action. Une fois votre demande soumise, l'administrateur devra l'approuver. Le montant sera crédité sur votre compte de dividendes après approbation.`
                    : "Vous pouvez vendre vos actions directement à un autre utilisateur. Le montant sera transféré immédiatement et la transaction est irréversible."
                  }
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre d'actions à vendre
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nombreActions}
                      onChange={(e) => handleActionsChange(e.target.value)}
                      className="w-full p-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                      placeholder="0"
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
                            ←
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
                    Maximum: {formatActions(currentActions)} actions disponibles
                  </p>
                </div>

                {saleType === 'user' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone de l'acheteur
                      </label>
                      <input
                        type="text"
                        value={telephoneAcheteur}
                        onChange={(e) => setTelephoneAcheteur(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+221XXXXXXXXX"
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant total (FCFA)
                      </label>
                      <input
                        type="text"
                        value={montant}
                        onChange={(e) => setMontant(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="0"
                        disabled={isPending}
                      />
                      {nombreActions && montant && (
                        <p className="text-xs text-gray-500 mt-1">
                          Prix unitaire: {formatAmount(parseFloat(montant) / parseInt(nombreActions))}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {saleType === 'company' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motif de la vente (optionnel)
                    </label>
                    <textarea
                      value={motif}
                      onChange={(e) => handleMotifChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Indiquez pourquoi vous souhaitez vendre vos actions..."
                      rows={3}
                      disabled={isPending}
                    ></textarea>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Résumé de votre vente</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actions actuelles:</span>
                      <span className="font-medium">{formatActions(currentActions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actions à vendre:</span>
                      <span className="font-medium">{formatActions(actionsNumber)}</span>
                    </div>
                    {saleType === 'company' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prix unitaire:</span>
                        <span className="font-medium">{formatAmount(PRIX_VENTE_ACTION)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600 font-medium">Montant à recevoir:</span>
                      <span className="font-bold text-green-600 text-lg">{formatAmount(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actions restantes après vente:</span>
                      <span className="font-medium text-blue-600">{formatActions(currentActions - actionsNumber)}</span>
                    </div>
                  </div>
                </div>

                {result && result.type === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <div>
                      <span className="text-red-700">{result.message}</span>
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
                      <span className="font-medium text-yellow-800">Confirmer votre {saleType === 'company' ? 'demande de vente' : 'vente'}</span>
                    </div>
                    <p className="text-yellow-700 mb-4">
                      {saleType === 'company' 
                        ? `Vous êtes sur le point de demander la vente de ${formatActions(actionsNumber)} actions. Après approbation, vous recevrez ${formatAmount(totalAmount)} sur votre compte de dividendes.`
                        : `Vous êtes sur le point de vendre ${formatActions(actionsNumber)} actions à ${telephoneAcheteur} pour ${formatAmount(totalAmount)}. Cette transaction est immédiate et irréversible.`
                      }
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSale}
                        disabled={isPending}
                        className="flex-1 bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          `Confirmer ${saleType === 'company' ? 'la demande' : 'la vente'}`
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
                      onClick={confirmSale}
                      disabled={
                        (saleType === 'company' && !validateActions(nombreActions)) ||
                        (saleType === 'user' && (!validateActions(nombreActions) || !telephoneAcheteur.trim() || !montant.trim() || parseFloat(montant) <= 0)) ||
                        isPending
                      }
                      className="flex-1 bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                    >
                      Soumettre {saleType === 'company' ? 'la demande' : 'la vente'}
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

export default ActionsSaleModal;