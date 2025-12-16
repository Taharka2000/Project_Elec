"use client";
import React from 'react';
import { Share, DollarSign, User } from 'lucide-react';
import { ActionsData, UserInfo } from '@/app/Models/ActionnaireModel';
import ActionsPurchaseModal from '../../../../lib/ActionsPurchaseModal';
import PurchaseMethodSelector from './PurchaseMethodSelector';
import ActionsSaleModal from './ActionsSaleModal';

interface ActionnaireUserViewProps {
  actions: ActionsData;
  user_info: UserInfo;
  prixUnitaire?: number; // ✅ Prix dynamique depuis l'API
}

const ActionnaireUserView: React.FC<ActionnaireUserViewProps> = ({ 
  actions, 
  user_info,
  prixUnitaire = 10000 // Prix par défaut si non fourni
}) => {
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

  // Fonction de rafraîchissement après vente
  const handleSaleSuccess = () => {
    // Force un rechargement complet de la page pour mettre à jour les données
    window.location.reload();
  };

  // Calculer la valeur par action
  const valuePerAction = actions.nbre_actions > 0 
    ? actions.dividende_actuel / actions.nbre_actions 
    : 0;

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
            <p className='text-sm text-gray-600 font-mono text-sm'>
              Achetez dès maintenant des actions et augmentez vos parts dans la société.
              <br />
              <span className="font-bold text-blue-600">1 action = {formatAmount(prixUnitaire)}</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Téléphone</p>
            <p className="font-semibold">{user_info.telephone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ID Actionnaire</p>
            <p className="font-mono text-sm">{user_info.id.slice(-8)}</p>
          </div>
          {/* ✅ Affichage du partenaire actuel s'il existe */}
          {user_info.telephonePartenaire && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Partenaire de parrainage</p>
              <div className="flex items-center mt-1">
                <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-semibold">{user_info.telephonePartenaire}</span>
                  <span className="ml-2 text-green-600">✅</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ce partenaire sera automatiquement utilisé pour vos prochains achats
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

        <div className="bg-white rounded-2xl p-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">Investissez dès maintenant</h3>
          <PurchaseMethodSelector 
            currentActions={actions.nbre_actions}
            currentDividends={actions.dividende_actuel}
            prixUnitaire={prixUnitaire} 
            userInfo={{
              firstName: user_info.firstName,
              lastName: user_info.lastName,
              telephone: user_info.telephone,
              telephonePartenaire: user_info.telephonePartenaire || null
            }}
          />
          <ActionsSaleModal
            currentActions={actions.nbre_actions}
            currentDividends={actions.dividende_actuel}
            prixUnitaire={prixUnitaire} // ✅ Passer le prix dynamique à la vente aussi
            userInfo={{
              firstName: user_info.firstName,
              lastName: user_info.lastName,
              telephone: user_info.telephone,
              telephonePartenaire: user_info.telephonePartenaire || null
            }}
            onSaleSuccess={handleSaleSuccess}
          />
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
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Rendement par action</span>
                <span className="font-bold text-yellow-600">{formatAmount(valuePerAction)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
                <span className="text-gray-600">Prix unitaire actuel</span>
                <span className="font-bold text-blue-600">{formatAmount(prixUnitaire)}</span>
              </div>
            </div>
          </div>
          
          {/* ✅ Section informations partenaire */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Parrainage</h3>
            <div className="space-y-3">
              {user_info.telephonePartenaire ? (
                <>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-gray-600">Partenaire actuel</span>
                    <span className="font-bold text-green-600">{user_info.telephonePartenaire}</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-700">
                      ✨ Votre partenaire recevra un bonus de 10% sur tous vos achats d'actions
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    💡 Vous pouvez définir un partenaire lors de votre prochain achat d'actions pour lui faire bénéficier d'un bonus de 10%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionnaireUserView;