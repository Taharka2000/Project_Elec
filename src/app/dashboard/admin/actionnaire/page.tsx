// app/admin/actionnaires/page.tsx - Version simple

import { fetchJSON } from '@/lib/api';
import { GET_ACTIONNAIRES_URL } from '@/actions/endpoint';
import { redirect } from 'next/navigation';
import ActionnairesAdminView from './_actionnaires/pagee';


interface PageProps {
  searchParams: Promise<{ annee?: string }>;
}

const ActionnairesAdminPage = async ({ searchParams }: PageProps) => {
  try {
    // Attendre les searchParams de manière asynchrone
    const params = await searchParams;
    
    // Construire l'URL avec le paramètre d'année si fourni
    let url = GET_ACTIONNAIRES_URL;
    if (params.annee) {
      url += `?annee=${params.annee}`;
    }

    // Récupérer tous les actionnaires
    const response = await fetchJSON(url);
   
    
    // Vérifier si la requête a réussi
    if (!response.success) {
      // Si pas autorisé, rediriger vers login
      if (response.message?.includes('Accès refusé')) {
        redirect('/auth/login');
      }
      
      // Autres erreurs
      throw new Error(response.message || 'Erreur lors de la récupération des actionnaires');
    }
    
    return (
      <ActionnairesAdminView
        actionnaires={response.actionnaires || []}
        statistiques={response.statistiques || {
          nombre_total_actionnaires: 0,
          actionnaires_actifs: 0,
          actionnaires_bloques: 0,
          total_actions: 0,
          total_dividendes: 0
        }}
        entreprise_info={response.entreprise_info}
        toutes_annees={response.toutes_annees || []}
        resume_global={response.resume_global || {
          nombre_annees: 0,
          total_benefices_toutes_annees: 0,
          premiere_annee: null,
          derniere_annee: null,
          moyenne_benefice_par_annee: 0
        }}
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
          <div className="space-x-2">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
            <button 
              onClick={() => window.history.back()} 
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default ActionnairesAdminPage;