"use client";
import React, { useState, useTransition } from 'react';
import { 
  ShoppingCart, 
  Calculator, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ExternalLink, 
  X,
  Plus,

} from 'lucide-react';
import { purchaseActionsWithDividends } from '@/actions/buydividente';

interface ActionsPurchaseModalProps {
  currentActions?: number;
  currentDividends?: number;
  userInfo?: {
    firstName: string;
    lastName: string;
    telephone: string;
  };
  prixUnitaire?: number; // ✅ Prix dynamique depuis l'API
  isOpen?: boolean;
  onClose?: () => void;
}

interface PurchaseResponse {
  type: "success" | "error";
  message: string;
  data?: {
    payment_info?: {
      transaction_id: string;
      payment_url: string;
      montant_total: number;
      currency: string;
      nombre_actions: number;
      prix_unitaire: number;
    };
    redirect_url?: string;
  };
  errors?: any;
}

const ActionsPurchaseModal: React.FC<ActionsPurchaseModalProps> = ({ 
  currentActions = 0, 
  currentDividends = 0,
  userInfo,
  prixUnitaire = 10000, // ✅ Prix dynamique depuis l'API, valeur par défaut
  isOpen = false,
  onClose
}) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [nombreActions, setNombreActions] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PurchaseResponse | null>(null);
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

  // ✅ Utiliser le prix dynamique au lieu d'une constante fixe
  const PrixUnitaire = prixUnitaire;

  const validateActions = (value: string): boolean => {
    if (!value) return false;
    const num = parseInt(value);
    return !isNaN(num) && num > 0 && num <= 10000 && Number.isInteger(num);
  };

  const handleActionsChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    setNombreActions(cleanValue);
    setResult(null);
  };

  const handleBackspace = () => {
    setNombreActions(prev => prev.slice(0, -1));
    setResult(null);
  };

  const handleClear = () => {
    setNombreActions("");
    setResult(null);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setNombreActions("");
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

  const handlePurchase = () => {
    if (!validateActions(nombreActions)) {
      setResult({
        type: "error",
        message: "Le nombre d'actions doit être un nombre entier entre 1 et 10000"
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await purchaseActionsWithDividends({
          nombre_actions: parseInt(nombreActions)
        });

        setResult(response);
        setShowConfirmation(false);

        if (response.type === "success" && response.data?.redirect_url) {
          setTimeout(() => {
            window.open(response.data.redirect_url, '_blank');
          }, 2000);
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

  // Calculer les valeurs pour l'affichage
  const actionsNumber = parseInt(nombreActions) || 0;
  const totalAmount = actionsNumber * PrixUnitaire;

  if (result?.type === "success") {
    return (
      <>
        <PurchaseButton />
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Achat effectué avec succès !
                </h2>
                <p className="text-gray-600 mb-6">
                  Votre commande d'actions a été effectuée avec succès 
                </p>
              
                <div className="space-y-3">
                  {result.data?.redirect_url && (
                    <a
                      href={result.data.redirect_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Voir les détails
                    </a>
                  )}
                  <button
                    onClick={closeModal}
                    className="w-full bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-300"
                  >
                    Fermer
                  </button>
                </div>
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="w-6 h-6 mr-2 text-blue-600" />
                Acheter des Actions avec Dividendes
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
                <p className="text-sm text-blue-700 mb-2">
                  Achat d'actions avec vos dividendes disponibles
                </p>
                <p className="text-sm text-gray-600">
                  Prix unitaire: {formatAmount(PrixUnitaire)} • Dividendes disponibles: {formatAmount(currentDividends)}
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
                    Maximum: 10,000 actions • Actions avec dividendes disponibles: {Math.floor(currentDividends / PrixUnitaire)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Résumé de votre achat</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actions à acheter:</span>
                      <span className="font-medium">{formatActions(actionsNumber)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix unitaire:</span>
                      <span className="font-medium">{formatAmount(PrixUnitaire)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coût total:</span>
                      <span className="font-medium text-blue-600">{formatAmount(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600 font-medium">Dividendes restants:</span>
                      <span className={`font-bold ${(currentDividends - totalAmount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(Math.max(0, currentDividends - totalAmount))}
                      </span>
                    </div>
                    {totalAmount > currentDividends && (
                      <div className="text-xs text-red-600 mt-1">
                        ⚠️ Dividendes insuffisants pour cet achat
                      </div>
                    )}
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
                      <span className="font-medium text-yellow-800">Confirmer votre achat</span>
                    </div>
                    <p className="text-yellow-700 mb-4">
                      Vous êtes sur le point d'acheter {formatActions(actionsNumber)} actions 
                      pour un montant total de {formatAmount(totalAmount)} en utilisant vos dividendes.
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
                      disabled={!validateActions(nombreActions) || isPending}
                      className="flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                    >
                      Procéder à l'achat
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