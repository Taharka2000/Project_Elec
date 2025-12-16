// app/admin/demandes-vente/page.tsx
import { fetchJSON } from '@/lib/api';
import { GET_ALL_SALE_REQUESTS_URL } from '@/actions/endpoint';
import { redirect } from 'next/navigation';
import DemandesVenteAdminView from './_components/sellAction';
import ErrorButtons from './_components/ErrorButtons';

interface PageProps {
  searchParams: Promise<{ status?: 'pending' | 'approved' | 'rejected', page?: string, limit?: string }>;
}

const DemandesVenteAdminPage = async ({ searchParams }: PageProps) => {
  try {
    // Attendre les searchParams de manière asynchrone
    const params = await searchParams;
    
    // MODIFICATION: Récupérer toutes les demandes en une seule fois
    // On utilise un limit très élevé pour récupérer toutes les demandes
    const url = `${GET_ALL_SALE_REQUESTS_URL}?limit=1000&page=1`;
    
    // Récupérer toutes les demandes de vente
    const response = await fetchJSON(url);
    //console.log('Réponse complète:', response);
    
    // Vérifier si la requête a réussi
    if (!response.success) {
      // Si pas autorisé, rediriger vers login
      if (response.message?.includes('Accès refusé')) {
        redirect('/auth/login');
      }
      
      // Autres erreurs - utiliser le composant client pour l'erreur
      const errorMessage = response.message || 'Erreur lors de la récupération des demandes de vente';
      return <ErrorButtons errorMessage={errorMessage} />;
    }
    
    // MODIFICATION: Créer une pagination côté client avec toutes les demandes
    const allDemandes = response.demandes || [];
    const currentPage = parseInt(params.page || '1');
    const perPage = 20; // Nombre d'éléments par page
    
    // Pagination côté client pour l'affichage initial
    const clientPagination = {
      current_page: currentPage,
      total_pages: Math.ceil(allDemandes.length / perPage),
      total_demandes: allDemandes.length,
      per_page: perPage
    };
    
    return (
      <DemandesVenteAdminView
        demandes={allDemandes} 
        pagination={clientPagination}
        statistiques={response.statistiques || {
          total_actions_vendues: 0,
          total_montant_verse: 0,
          demandes_approuvees: 0,
          demandes_en_attente: 0,
          demandes_rejetees: 0
        }}
        statusFilter={params.status || 'all'}
      />
    );
    
  } catch (error) {
    console.error('Erreur lors du chargement de la page demandes de vente:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Une erreur est survenue lors du chargement des demandes de vente.';
      
    return <ErrorButtons errorMessage={errorMessage} />;
  }
};

export default DemandesVenteAdminPage;