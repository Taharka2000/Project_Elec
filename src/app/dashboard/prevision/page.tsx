// app/dashboard/prevision/page.tsx
import { getAllProjections } from '@/actions/projectionActions';
import { calculateProjectionStats } from '@/lib/projectionUtils';
import ProjectionsAdminView from './_components/ProjectionsAdminView';


export default async function PrevisionPage() {
  try {
   
    
    // Récupérer les projections depuis l'API
    const result = await getAllProjections();
    
    
    if (result.type === 'success') {
      // Données récupérées avec succès
      const projections = result.projections || result.data || [];
      const statistiques = result.statistiques || calculateProjectionStats(projections);
      
  
      
      return (
        <ProjectionsAdminView 
          projections={projections}
          statistiques={statistiques}
        />
      );
    } else {
      // Erreur lors de la récupération
      console.error("Erreur récupération projections:", result.message);
      
      
   
    }
    
  } catch (error) {
    console.error('Erreur dans PrevisionPage:', error);
    
    // Fallback en cas d'erreur critique
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 mb-4">
            Impossible de charger les projections. Vérifiez votre connexion au serveur.
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
}