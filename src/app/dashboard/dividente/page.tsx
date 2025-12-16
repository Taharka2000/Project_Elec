

import { fetchJSON } from '@/lib/api';
import { GET_ACTIONNAIRES_URL_2, GET_TRANSACTIONS_URL } from '@/actions/endpoint';
import ActionnaireUserViewRer from './_components/actionnaires';

const ActionnairesAdminPage = async () => {
  try {
    // Récupérer tous les actionnaires
    const response = await fetchJSON(GET_ACTIONNAIRES_URL_2);

    let transactionsData = [];
    try {
      const transactionsResponse = await fetchJSON(GET_TRANSACTIONS_URL);
      if (transactionsResponse.success) {
        transactionsData = transactionsResponse.data || [];
      } else {
        console.warn("Erreur lors de la récupération des transactions:", transactionsResponse.message);
      }
    } catch (transactionError) {
      console.warn("Impossible de récupérer les transactions:", transactionError);

    }
    
    return (
      <ActionnaireUserViewRer
        actions={response.actions}
        user_info={response.user_info}
        transactions={transactionsData}
      />
    );
    
  } catch (error) {
    console.error('Erreur lors du chargement de la page actionnaires:', error);
    
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
            {error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement des actionnaires.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }
};

export default ActionnairesAdminPage;