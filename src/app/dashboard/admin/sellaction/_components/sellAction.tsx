// app/admin/demandes-vente/_demandes-vente/page.tsx
"use client";
import React, { useState, useTransition, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  UserCheck, 
  AlertCircle, 
  CheckCircle, 
  Search, 
  Filter,
  X,
  SortAsc,
  SortDesc,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Calendar,
  User,
  Info
} from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { approveActionsSaleRequest, rejectActionsSaleRequest } from '@/actions/selldividente';
import Pagination from '../../actionnaire/_actionnaires/Pagination';

// Types (identiques)
interface Utilisateur {
  id: string;
  nom: string;
  telephone: string;
  actions_actuelles: number;
  dividendes_actuels: number;
}

interface Demande {
  id: string;
  utilisateur: Utilisateur;
  nombre_actions: number;
  prix_unitaire: number;
  montant_total: number;
  status: 'pending' | 'approved' | 'rejected';
  motif: string;
  date_demande: string;
  date_traitement?: string;
  commentaire_admin?: string;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_demandes: number;
  per_page: number;
}

interface Statistiques {
  total_actions_vendues: number;
  total_montant_verse: number;
  demandes_approuvees: number;
  demandes_en_attente: number;
  demandes_rejetees: number;
}

interface DemandesVenteAdminViewProps {
  demandes: Demande[];
  pagination: PaginationInfo;
  statistiques: Statistiques;
  statusFilter?: 'all' | 'pending' | 'approved' | 'rejected';
}

type SortField = 'date' | 'nom' | 'actions' | 'montant' | 'status';
type SortDirection = 'asc' | 'desc';

const DemandesVenteAdminView: React.FC<DemandesVenteAdminViewProps> = ({
  demandes: initialDemandes,
  pagination: initialPagination,
  statistiques: initialStatistiques,
  statusFilter = 'all'
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // MODIFICATION: Utiliser toutes les demandes comme base
  const [allDemandes, setAllDemandes] = useState<Demande[]>(initialDemandes);
  const [filteredDemandes, setFilteredDemandes] = useState<Demande[]>(initialDemandes);
  const [pagination, setPagination] = useState<PaginationInfo>(initialPagination);
  const [statistiques, setStatistiques] = useState<Statistiques>(initialStatistiques);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>(statusFilter);
  const [isPending, startTransition] = useTransition();
  
  // États pour les filtres et le tri
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // État pour la modal de confirmation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    action: 'approve' | 'reject';
    demande: Demande | null;
    commentaire: string;
  }>({
    action: 'approve',
    demande: null,
    commentaire: ''
  });

  // MODIFICATION: Fonction pour calculer les statistiques basées sur toutes les demandes
  const calculateAdditionalStats = (demandes: Demande[]) => {
    const actionsEnAttente = demandes
      .filter(d => d.status === 'pending')
      .reduce((sum, d) => sum + d.nombre_actions, 0);
    
    const montantEnAttente = demandes
      .filter(d => d.status === 'pending')
      .reduce((sum, d) => sum + d.montant_total, 0);
    
    const totalActionsDemandees = demandes.reduce((sum, d) => sum + d.nombre_actions, 0);
    const totalMontantDemande = demandes.reduce((sum, d) => sum + d.montant_total, 0);
    
    return {
      actionsEnAttente,
      montantEnAttente,
      totalActionsDemandees,
      totalMontantDemande
    };
  };

  // Calculer les statistiques additionnelles
  const additionalStats = useMemo(() => {
    return calculateAdditionalStats(allDemandes);
  }, [allDemandes]);

  // Fonctions de formatage (identiques)
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

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // MODIFICATION: Fonction optimisée pour appliquer tous les filtres et tri
  const applyFiltersAndSort = useMemo(() => {
    let filtered = [...allDemandes];
    
    // Filtrer par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(demande => demande.status === selectedStatus);
    }
    
    // Filtrer par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(demande => 
        demande.utilisateur.nom.toLowerCase().includes(searchLower) ||
        demande.utilisateur.telephone.includes(searchLower) ||
        demande.id.toLowerCase().includes(searchLower)
      );
    }
    
    // Appliquer le tri
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date_demande).getTime() - new Date(b.date_demande).getTime();
          break;
        case 'nom':
          comparison = a.utilisateur.nom.localeCompare(b.utilisateur.nom);
          break;
        case 'actions':
          comparison = a.nombre_actions - b.nombre_actions;
          break;
        case 'montant':
          comparison = a.montant_total - b.montant_total;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [allDemandes, selectedStatus, searchTerm, sortField, sortDirection]);

  // MODIFICATION: Effet pour mettre à jour les demandes filtrées et la pagination
  useEffect(() => {
    const filtered = applyFiltersAndSort;
    setFilteredDemandes(filtered);
    
    // Mettre à jour la pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pagination.per_page) || 1;
    
    setPagination(prev => ({
      ...prev,
      total_demandes: totalItems,
      total_pages: totalPages,
      current_page: prev.current_page > totalPages ? 1 : prev.current_page
    }));
  }, [applyFiltersAndSort, pagination.per_page]);

  // Fonction pour mettre à jour l'URL sans rechargement
  const updateUrlParams = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    
    const url = `${pathname}?${params.toString()}`;
    window.history.replaceState({}, '', url);
  };

  // Fonction pour gérer le tri
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Fonction pour effacer la recherche
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Fonction pour filtrer par statut
  const handleStatusFilter = (status: 'all' | 'pending' | 'approved' | 'rejected') => {
    setSelectedStatus(status);
    updateUrlParams(status);
    // Réinitialiser à la page 1 lors du changement de filtre
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  // Fonction pour gérer la pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      current_page: page
    }));
    
    // Mettre à jour l'URL
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    const url = `${pathname}?${params.toString()}`;
    window.history.replaceState({}, '', url);
    
    // Scroll vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // MODIFICATION: Fonction pour obtenir les demandes paginées à partir des demandes filtrées
  const getPaginatedDemandes = () => {
    const startIndex = (pagination.current_page - 1) * pagination.per_page;
    const endIndex = startIndex + pagination.per_page;
    return filteredDemandes.slice(startIndex, endIndex);
  };

  // Fonctions pour la modal (identiques)
  const openApproveModal = (demande: Demande) => {
    setModalData({
      action: 'approve',
      demande,
      commentaire: ''
    });
    setIsModalOpen(true);
  };

  const openRejectModal = (demande: Demande) => {
    setModalData({
      action: 'reject',
      demande,
      commentaire: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData({
      action: 'approve',
      demande: null,
      commentaire: ''
    });
  };

  const handleCommentaireChange = (value: string) => {
    setModalData({ ...modalData, commentaire: value });
  };

  // MODIFICATION: Fonction pour traiter la demande avec mise à jour optimisée
  const handleProcessRequest = () => {
    if (!modalData.demande) return;
    
    startTransition(async () => {
      try {
        let response;
        
        if (modalData.action === 'approve') {
          response = await approveActionsSaleRequest({
            demandeId: modalData.demande.id,
            commentaire: modalData.commentaire
          });
        } else {
          response = await rejectActionsSaleRequest({
            demandeId: modalData.demande.id,
            commentaire: modalData.commentaire
          });
        }
        
        if (response.type === 'success') {
          // Mettre à jour la demande dans l'état local
          const updatedDemande = { 
            ...modalData.demande, 
            status: modalData.action === 'approve' ? 'approved' : 'rejected',
            date_traitement: new Date().toISOString(),
            commentaire_admin: modalData.commentaire
          };
          
          // Mettre à jour toutes les demandes
          setAllDemandes(prevDemandes => 
            prevDemandes.map(d => d.id === updatedDemande.id ? updatedDemande : d)
          );
          
          // Mettre à jour les statistiques
          if (modalData.action === 'approve') {
            setStatistiques(prev => ({
              ...prev,
              demandes_approuvees: prev.demandes_approuvees + 1,
              demandes_en_attente: prev.demandes_en_attente - 1,
              total_actions_vendues: prev.total_actions_vendues + modalData.demande!.nombre_actions,
              total_montant_verse: prev.total_montant_verse + modalData.demande!.montant_total
            }));
          } else {
            setStatistiques(prev => ({
              ...prev,
              demandes_rejetees: prev.demandes_rejetees + 1,
              demandes_en_attente: prev.demandes_en_attente - 1
            }));
          }
          
          closeModal();
          
          alert(
            modalData.action === 'approve'
              ? 'Demande approuvée avec succès!'
              : 'Demande rejetée avec succès!'
          );
        } else {
          throw new Error(response.message || 'Une erreur est survenue');
        }
      } catch (error) {
        console.error(`Erreur lors du traitement de la demande:`, error);
        alert(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`);
      }
    });
  };

  // Fonctions utilitaires (identiques)
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approuvée
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejetée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Obtenir les demandes à afficher
  const demandesToDisplay = getPaginatedDemandes();

  // Le reste du JSX reste identique à votre composant original...
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Gestion des Demandes de Vente</h1>
        <p className="text-gray-600 mt-1">
          Gérez les demandes de vente d'actions des actionnaires ({allDemandes.length} demandes au total)
        </p>
      </div>

      {/* Statistiques - Version améliorée */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vendu</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(statistiques.total_montant_verse)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actions Vendues</p>
              <p className="text-2xl font-bold text-gray-900">{formatActions(statistiques.total_actions_vendues)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Demandé</p>
              <p className="text-2xl font-bold text-indigo-600">{formatAmount(additionalStats.totalMontantDemande)}</p>
              <p className="text-xs text-gray-500">{formatActions(additionalStats.totalActionsDemandees)} actions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-yellow-600">{statistiques.demandes_en_attente}</p>
              <p className="text-xs text-gray-500">{formatAmount(additionalStats.montantEnAttente)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approuvées</p>
              <p className="text-2xl font-bold text-green-600">{statistiques.demandes_approuvees}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejetées</p>
              <p className="text-2xl font-bold text-red-600">{statistiques.demandes_rejetees}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtres de statut */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({allDemandes.length})
            </button>
            <button
              onClick={() => handleStatusFilter('pending')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedStatus === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En attente ({statistiques.demandes_en_attente})
            </button>
            <button
              onClick={() => handleStatusFilter('approved')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedStatus === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approuvées ({statistiques.demandes_approuvees})
            </button>
            <button
              onClick={() => handleStatusFilter('rejected')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedStatus === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejetées ({statistiques.demandes_rejetees})
            </button>
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Tri
          </button>
        </div>

        {/* Options de tri */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 mr-3">Trier par:</span>
              {[
                { field: 'date' as SortField, label: 'Date' },
                { field: 'nom' as SortField, label: 'Nom' },
                { field: 'actions' as SortField, label: 'Actions' },
                { field: 'montant' as SortField, label: 'Montant' },
                { field: 'status' as SortField, label: 'Statut' }
              ].map(({ field, label }) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                    sortField === field
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                  {getSortIcon(field)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Résultats et pagination */}
      <div className="mb-4 text-sm text-gray-600">
        Affichage de {((pagination.current_page - 1) * pagination.per_page) + 1} à {Math.min(pagination.current_page * pagination.per_page, filteredDemandes.length)} sur {filteredDemandes.length} demandes
        {selectedStatus !== 'all' && ` (filtrées)`}
        {searchTerm &&` (recherche: "${searchTerm}")`}
      </div>

      {/* Liste des demandes */}
      {demandesToDisplay.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Info className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">Aucune demande trouvée</p>
              <p className="text-sm text-gray-500">
                Il n'y a aucune demande de vente d'actions {selectedStatus !== 'all' && `avec le statut "${
                  selectedStatus === 'pending' ? 'en attente' : 
                  selectedStatus === 'approved' ? 'approuvée' : 'rejetée'
                }"`}
                {searchTerm && ` correspondant à votre recherche "${searchTerm}"`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Table view pour Desktop */}
          <div className="bg-white rounded-lg shadow hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center hover:text-blue-600 transition-colors"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Date
                        {getSortIcon('date')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
                      <button
                        onClick={() => handleSort('nom')}
                        className="flex items-center hover:text-blue-600 transition-colors"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Actionnaire
                        {getSortIcon('nom')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
                      <button
                        onClick={() => handleSort('actions')}
                        className="flex items-center hover:text-blue-600 transition-colors"
                      >
                        Actions
                        {getSortIcon('actions')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
                      <button
                        onClick={() => handleSort('montant')}
                        className="flex items-center hover:text-blue-600 transition-colors"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Montant
                        {getSortIcon('montant')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center hover:text-blue-600 transition-colors"
                      >
                        Statut
                        {getSortIcon('status')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-800">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {demandesToDisplay.map((demande) => (
                    <tr key={demande.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(demande.date_demande)}</div>
                        <div className="text-xs text-gray-500">ID: {demande.id.slice(-8)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{demande.utilisateur.nom}</div>
                        <div className="text-xs text-gray-500">{demande.utilisateur.telephone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatActions(demande.nombre_actions)}</div>
                        <div className="text-xs text-gray-500">
                          Après: {formatActions(demande.utilisateur.actions_actuelles - demande.nombre_actions)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{formatAmount(demande.montant_total)}</div>
                        <div className="text-xs text-gray-500">{formatAmount(demande.prix_unitaire)} / action</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(demande.status)}
                        {demande.status !== 'pending' && (
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(demande.date_traitement || demande.updated_at)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {demande.status === 'pending' ? (
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => openApproveModal(demande)}
                              disabled={isPending}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Approuver
                            </button>
                            <button
                              onClick={() => openRejectModal(demande)}
                              disabled={isPending}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ThumbsDown className="w-3 h-3 mr-1" />
                              Rejeter
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {demande.commentaire_admin ? (
                              <span title={demande.commentaire_admin}>
                                {demande.commentaire_admin.length > 30 
                                  ? demande.commentaire_admin.substring(0, 30) + '...' 
                                  : demande.commentaire_admin}
                              </span>
                            ) : (
                              demande.status === 'approved' ? 'Approuvée' : 'Rejetée'
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vue Mobile/Tablette */}
          <div className="lg:hidden space-y-4">
            {demandesToDisplay.map((demande) => (
              <div key={demande.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm text-gray-500">
                      {formatDate(demande.date_demande)}
                    </div>
                    <div className="text-xs text-gray-400">
                      ID: {demande.id.slice(-8)}
                    </div>
                  </div>
                  {getStatusBadge(demande.status)}
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{demande.utilisateur.nom}</h3>
                  <p className="text-sm text-gray-600">{demande.utilisateur.telephone}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Actions à vendre</div>
                    <p className="text-lg font-medium text-gray-900">{formatActions(demande.nombre_actions)}</p>
                    <div className="text-xs text-gray-500">
                      Actuelles: {formatActions(demande.utilisateur.actions_actuelles)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Montant total</div>
                    <p className="text-lg font-medium text-blue-600">{formatAmount(demande.montant_total)}</p>
                    <div className="text-xs text-gray-500">
                      {formatAmount(demande.prix_unitaire)} par action
                    </div>
                  </div>
                </div>

                {demande.motif && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">Motif</div>
                    <p className="text-sm bg-gray-50 p-2 rounded">{demande.motif}</p>
                  </div>
                )}

                {demande.status === 'pending' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openApproveModal(demande)}
                      disabled={isPending}
                      className="flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Approuver
                    </button>
                    <button
                      onClick={() => openRejectModal(demande)}
                      disabled={isPending}
                      className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Rejeter
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600 mb-1">
                      {demande.status === 'approved' ? 'Approuvée' : 'Rejetée'} le {formatDate(demande.date_traitement || demande.updated_at)}
                    </div>
                    {demande.commentaire_admin && (
                      <div className="text-sm">
                        <span className="font-medium">Commentaire:</span> {demande.commentaire_admin}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="bg-white rounded-lg shadow p-4">
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                onPageChange={handlePageChange}
                itemsPerPage={pagination.per_page}
                totalItems={pagination.total_demandes}
              />
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmation */}
      {isModalOpen && modalData.demande && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                {modalData.action === 'approve' ? (
                  <>
                    <ThumbsUp className="w-6 h-6 mr-2 text-green-600" />
                    Approuver la demande
                  </>
                ) : (
                  <>
                    <ThumbsDown className="w-6 h-6 mr-2 text-red-600" />
                    Rejeter la demande
                  </>
                )}
              </h2>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Actionnaire:</span>
                    <p className="font-bold text-gray-900">{modalData.demande.utilisateur.nom}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Téléphone:</span>
                    <p className="font-bold text-gray-900">{modalData.demande.utilisateur.telephone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Actions à vendre:</span>
                    <p className="font-bold text-blue-600">{formatActions(modalData.demande.nombre_actions)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Montant total:</span>
                    <p className="font-bold text-green-600">{formatAmount(modalData.demande.montant_total)}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-gray-600">Date de la demande:</span>
                  <p className="font-medium text-gray-900">{formatDate(modalData.demande.date_demande)}</p>
                </div>
                {modalData.demande.motif && (
                  <div className="mt-3">
                    <span className="text-gray-600">Motif:</span>
                    <p className="font-medium text-gray-900 bg-white p-2 rounded mt-1">{modalData.demande.motif}</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {modalData.action === 'approve' ? 'Commentaire (optionnel)' : 'Raison du rejet'}
                </label>
                <textarea
                  value={modalData.commentaire}
                  onChange={(e) => handleCommentaireChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={modalData.action === 'approve' 
                    ? "Ajouter un commentaire pour l'actionnaire..." 
                    : "Veuillez indiquer la raison du rejet..."}
                  rows={3}
                  required={modalData.action === 'reject'}
                ></textarea>
                {modalData.action === 'reject' && !modalData.commentaire && (
                  <p className="text-red-600 text-xs mt-1">
                    La raison du rejet est obligatoire
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleProcessRequest}
                  disabled={isPending || (modalData.action === 'reject' && !modalData.commentaire)}
                  className={`flex-1 font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center ${
                    modalData.action === 'approve'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Traitement...
                    </>
                  ) : (
                    modalData.action === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'
                  )}
                </button>
                <button
                  onClick={closeModal}
                  disabled={isPending}
                  className="px-6 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandesVenteAdminView;