import { fetchJSON } from '@/lib/api';
import { GET_ACTIONNAIRES_URL_2, GET_ALL_PRICES_URL } from '@/actions/endpoint';

import ActionnaireUserView from './_components/actionnaires';

const MyActionsPage = async () => {
  try {
    // Récupérer les données de l'actionnaire
    const actionnaireResponse = await fetchJSON(GET_ACTIONNAIRES_URL_2);
    
    // Récupérer les prix des actions
    const pricesResponse = await fetchJSON(GET_ALL_PRICES_URL);
    
    // Extraire le prix NORMAL (pour utilisateurs normaux)
    const normalPrice = pricesResponse?.data?.find(
      (price: any) => price.type === 'NORMAL' && price.actif === true
    );
    
    // Utiliser le prix récupéré ou un prix par défaut
    const prixUnitaire = normalPrice?.prix_unitaire;
    
    
    return (
      <ActionnaireUserView
        actions={actionnaireResponse.actions}
        user_info={actionnaireResponse.user_info}
        prixUnitaire={prixUnitaire}
      />
    );
  } catch (error) {
    console.error('Erreur lors du chargement de la page mes actions:', error);

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement de vos actions.'}
          </p>
        </div>
      </div>
    );
  }
};

export default MyActionsPage;