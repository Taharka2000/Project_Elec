import { fetchJSON } from '@/lib/api';
import { GET_BENEFICES_URL } from '@/actions/endpoint';
import ActionnairesAdminView from './_actionnaires/rapport';

// ✅ Ajout des directives pour forcer le mode dynamique
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface PageProps {
  // ✅ Changement: searchParams n'est plus une Promise avec dynamic = 'force-dynamic'
  searchParams: { annee?: string };
}

const ActionnairesAdminPage = async ({ searchParams }: PageProps) => {
  try {
    // ✅ Suppression du await - searchParams est maintenant synchrone
    const params = searchParams;
    
    let url = GET_BENEFICES_URL;
    if (params.annee) {
      url += `?annee=${params.annee}`;
    }
    const response = await fetchJSON(url);
    return (
      <ActionnairesAdminView
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
    
    // ✅ Composant d'erreur séparé pour gérer les event handlers
    return <ErrorComponent error={error} />;
  }
};

// ✅ Composant d'erreur séparé avec 'use client' pour gérer onClick
function ErrorComponent({ error }: { error: unknown }) {
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
      </div>
    </div>
  );
}

export default ActionnairesAdminPage;