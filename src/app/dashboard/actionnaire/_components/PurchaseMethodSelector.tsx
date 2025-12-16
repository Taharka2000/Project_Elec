"use client";
import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Wallet, 
  DollarSign, 
  Plus,
  X,
  ArrowRight,
  Bitcoin,
} from 'lucide-react';
import ActionsPurchaseModal from './ActionsPurchaseModal';
import DividendPurchaseModal from './DividendPurchaseModal';
import CryptoPurchaseModal from './CryptoPurchaseModal';



interface PurchaseMethodSelectorProps {
  currentActions?: number;
  currentDividends?: number;
  prixUnitaire?: number; // ✅ Ajout du prix unitaire dynamique
  userInfo?: {
    firstName: string;
    lastName: string;
    telephone: string;
    telephonePartenaire?: string | null; // ✅ Ajout du téléphone partenaire
  };
}

const PurchaseMethodSelector: React.FC<PurchaseMethodSelectorProps> = ({ 
  currentActions = 0, 
  currentDividends = 0,
  prixUnitaire ,// ✅ Prix par défaut si non fourni
  userInfo 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'dividends' | 'crypto' | null>(null);

  // Fonction pour formater les montants
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Ouvrir le modal de sélectionhghgh
  const openMethodSelector = () => {
    setIsModalOpen(true);
    setSelectedMethod(null);
  };

  // Fermer le modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMethod(null);
  };

  // Sélectionner une méthode
  const selectMethod = (method: 'wallet' | 'dividends' | 'crypto') => {
    setSelectedMethod(method);
  };

  // Retour à la sélection
  const backToSelection = () => {
    setSelectedMethod(null);
  };

  // Bouton principal d'achat
  const PurchaseButton = () => (
    <button
      onClick={openMethodSelector}
      className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
    >
      <Plus className="w-4 h-4 mr-2" />
      Acheter des actions
    </button>
  );

  // Si une méthode est sélectionnée, afficher le modal correspondant
  if (selectedMethod === 'wallet') {
    return (
      <>
        <PurchaseButton />
        <ActionsPurchaseModal
          currentActions={currentActions}
          currentDividends={currentDividends}
          userInfo={userInfo}
          prixUnitaire={prixUnitaire} // ✅ AJOUT DU PRIX DYNAMIQUE
          isOpen={true}
          onClose={backToSelection}
        />
      </>
    );
  }

  if (selectedMethod === 'dividends') {
    return (
      <>
        <PurchaseButton />
        <DividendPurchaseModal
          currentActions={currentActions}
          currentDividends={currentDividends}
          userInfo={userInfo}
          prixUnitaire={prixUnitaire} // ✅ AJOUT DU PRIX DYNAMIQUE
          isOpen={true}
          onClose={backToSelection}
        />
      </>
    );
  }

  if (selectedMethod === 'crypto') {
    return (
      <>
        <PurchaseButton />
        <CryptoPurchaseModal
          currentActions={currentActions}
          userInfo={userInfo}
          prixUnitaire={prixUnitaire} // ✅ AJOUT DU PRIX DYNAMIQUE
          isOpen={true}
          onClose={backToSelection}
        />
      </>
    );
  }

  return (
    <>
      <PurchaseButton />
      
      {/* Modal de sélection de méthode */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                Choisir la méthode d'achat
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">
                Comment souhaitez-vous acheter vos actions ?
              </p>

              <div className="space-y-4">
                {/* Option 1: Paiement par wallet */}
                <button
                  onClick={() => selectMethod('wallet')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                        <Wallet className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900">Paiement mobile</h3>
                        <p className="text-sm text-gray-600">
                          PayDunya, Orange Money, Wave, etc.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </button>

                {/* Option 2: Paiement par crypto */}
                <button
                  onClick={() => selectMethod('crypto')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                        <Bitcoin className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900">Crypto-monnaie</h3>
                        <p className="text-sm text-gray-600">
                          USDT (TRC20) - 1 action = 4,5 USDT
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </button>

                {/* Option 3: Achat avec dividendes */}
                <button
                  onClick={() => selectMethod('dividends')}
                  disabled={currentDividends <= 0}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 group ${
                    currentDividends > 0
                      ? 'border-gray-200 hover:border-green-500 hover:bg-green-50'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full transition-colors ${
                        currentDividends > 0
                          ? 'bg-green-100 group-hover:bg-green-200'
                          : 'bg-gray-100'
                      }`}>
                        <DollarSign className={`w-6 h-6 ${
                          currentDividends > 0 ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="ml-4">
                        <h3 className={`font-semibold ${
                          currentDividends > 0 ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          Utiliser mes dividendes
                        </h3>
                        <p className={`text-sm ${
                          currentDividends > 0 ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          Solde: {formatAmount(currentDividends)}
                        </p>
                      </div>
                    </div>
                    {currentDividends > 0 && (
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                    )}
                  </div>
                </button>
              </div>

              {currentDividends <= 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700 text-center">
                    💡 Vous n'avez pas encore de dividendes disponibles pour acheter des actions.
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Actions actuelles:</span>
                    <span className="font-medium">{currentActions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dividendes disponibles:</span>
                    <span className="font-medium">{formatAmount(currentDividends)}</span>
                  </div>
                  {/* ✅ Affichage du prix unitaire */}
                  <div className="flex justify-between">
                    <span>Prix unitaire actuel:</span>
                    <span className="font-medium text-blue-600">{formatAmount(prixUnitaire)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PurchaseMethodSelector;