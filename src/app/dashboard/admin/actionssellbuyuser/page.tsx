// app/actions-sales-history/page.tsx
import { fetchJSON } from '@/lib/api';
import ActionsSalesHistory from './_components/ActionsSalesHistory';
import { GET_TRANSACTIONS_ACTIONS_SELL_BY_USER_URL } from '@/actions/endpoint';

const ActionsSalesHistoryPage = async () => {
  try {
    // Récupérer les transactions de ventes d'actions
    const transactionsResponse = await fetchJSON(GET_TRANSACTIONS_ACTIONS_SELL_BY_USER_URL);
    //console.log(transactionsResponse);
    
    return (
      <ActionsSalesHistory
        transactions={transactionsResponse?.transactions || []}
      />
    );
    
  } catch (error) {
    console.error('Erreur lors du chargement des transactions:', error);
    
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
            {error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement des transactions.'}
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

export default ActionsSalesHistoryPage;