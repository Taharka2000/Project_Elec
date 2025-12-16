"use client";
import React, { useState, useMemo } from 'react';
import { 
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingDown,
  Search,
  DollarSign
} from 'lucide-react';

// Types adaptés pour les ventes d'actions
interface Demande {
  id: string;
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

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  actions_actuelles?: number;
  dividendes_actuels?: number;
}

interface Statistiques {
  total_actions_vendues: number;
  total_montant_recu: number;
  demandes_approuvees: number;
  demandes_en_attente: number;
  demandes_rejetees: number;
}

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_demandes: number;
  per_page: number;
}

interface MySalesListViewProps {
  user_info?: UserInfo;
  demandes: Demande[];
  statistiques: Statistiques;
  pagination: PaginationInfo;
}

const MySalesListView: React.FC<MySalesListViewProps> = ({ 
  user_info,
  demandes,
  statistiques,
  pagination: initialPagination
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(initialPagination.current_page);
  const [itemsPerPage, setItemsPerPage] = useState(initialPagination.per_page);
  const [pagination, setPagination] = useState(initialPagination);

  // Fonction pour formater les montants
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Fonction pour obtenir le label de statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvée';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejetée';
      default:
        return status;
    }
  };

  // Filtrer, rechercher et trier les demandes
  const filteredAndSortedDemandes = useMemo(() => {
    // D'abord la recherche
    let filtered = demandes.filter(demande => {
      // Si un terme de recherche est présent, filtrer par ID ou motif
      if (searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        const idMatches = demande.id.toLowerCase().includes(searchLower);
        const motifMatches = demande.motif.toLowerCase().includes(searchLower);
        
        if (!(idMatches || motifMatches)) {
          return false;
        }
      }
      
      // Ensuite filtrer par statut
      if (statusFilter === 'all') return true;
      return demande.status === statusFilter;
    });

    // Puis trier
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.date_demande).getTime() - new Date(b.date_demande).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.montant_total - b.montant_total;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [demandes, statusFilter, sortBy, sortOrder, searchTerm]);

  // Calculer les données de pagination
  const paginationData = useMemo(() => {
    const totalItems = filteredAndSortedDemandes.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredAndSortedDemandes.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentItems,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [filteredAndSortedDemandes, currentPage, itemsPerPage]);

  // Calculer les statistiques additionnelles
  const additionalStats = useMemo(() => {
    // Total des actions en attente
    const actionsEnAttente = demandes
      .filter(d => d.status === 'pending')
      .reduce((sum, d) => sum + d.nombre_actions, 0);
    
    // Total des montants en attente
    const montantEnAttente = demandes
      .filter(d => d.status === 'pending')
      .reduce((sum, d) => sum + d.montant_total, 0);
    
    // Total de toutes les actions (toutes les demandes)
    const totalActionsDemandees = demandes.reduce((sum, d) => sum + d.nombre_actions, 0);
    
    // Total de tous les montants (toutes les demandes)
    const totalMontantDemande = demandes.reduce((sum, d) => sum + d.montant_total, 0);
    
    return {
      actionsEnAttente,
      montantEnAttente,
      totalActionsDemandees,
      totalMontantDemande
    };
  }, [demandes]);

  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const { totalPages } = paginationData;
    const delta = 2;
    const pages: (number | string)[] = [];

    pages.push(1);

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  // Fonction d'export CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Date Demande', 'ID Demande', 'Nombre Actions', 'Prix Unitaire', 'Montant Total', 'Statut', 'Motif', 'Date Traitement', 'Commentaire Admin'].join(','),
      ...filteredAndSortedDemandes.map(d => [
        new Date(d.date_demande).toLocaleDateString('fr-FR'),
        d.id,
        d.nombre_actions,
        d.prix_unitaire,
        d.montant_total,
        getStatusLabel(d.status),
        `"${d.motif}"`,
        d.date_traitement ? new Date(d.date_traitement).toLocaleDateString('fr-FR') : '',
        d.commentaire_admin ? `"${d.commentaire_admin}"` : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `demandes_vente_actions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600 flex items-center">
          <TrendingDown className="w-8 h-8 mr-3" />
          Mes Demandes de Vente d'Actions
        </h1>
        <p className="text-gray-600 mt-1">
          {user_info ? (
            `Bonjour ${user_info.firstName} ${user_info.lastName}, voici l'historique de vos demandes de vente d'actions`
          ) : (
            'Voici l\'historique de vos demandes de vente d\'actions'
          )}
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-indigo-100">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Demandes</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistiques.demandes_approuvees + statistiques.demandes_en_attente + statistiques.demandes_rejetees}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approuvées</p>
              <p className="text-2xl font-bold text-green-600">{statistiques.demandes_approuvees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-100">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{statistiques.demandes_en_attente}</p>
              <p className="text-xs text-gray-500">{formatAmount(additionalStats.montantEnAttente)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejetées</p>
              <p className="text-2xl font-bold text-red-600">{statistiques.demandes_rejetees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-100">
              <TrendingDown className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Actions Vendues</p>
              <p className="text-xl font-bold text-purple-600">{statistiques.total_actions_vendues}</p>
              <p className="text-xs text-gray-500">Demandées: {additionalStats.totalActionsDemandees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Montant Total</p>
              <p className="text-lg font-bold text-blue-600">{formatAmount(statistiques.total_montant_recu)}</p>
              <p className="text-xs text-gray-500">Demandé: {formatAmount(additionalStats.totalMontantDemande)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-wrap gap-y-2">
              <div className="flex items-center">
                <Filter className="w-4 h-4 text-gray-500 mr-2" />
                <label className="text-sm font-medium text-gray-700 mr-2">Statut:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous</option>
                  <option value="approved">Approuvées</option>
                  <option value="pending">En attente</option>
                  <option value="rejected">Rejetées</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 mr-2">Trier par:</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy as 'date' | 'amount');
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date-desc">Date (récent)</option>
                  <option value="date-asc">Date (ancien)</option>
                  <option value="amount-desc">Montant (élevé)</option>
                  <option value="amount-asc">Montant (faible)</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 mr-2">Par page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full lg:w-auto">
              <div className="relative flex-grow lg:flex-grow-0 lg:w-64">
                <input
                  type="text"
                  placeholder="Rechercher par motif ou ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <button
                onClick={() => {
                  // Réinitialiser la recherche
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSortBy('date');
                  setSortOrder('desc');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Réinitialiser
              </button>

              <button
                onClick={exportToCSV}
                disabled={filteredAndSortedDemandes.length === 0}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter CSV ({filteredAndSortedDemandes.length})
              </button>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="p-4">
          {paginationData.currentItems.length === 0 ? (
            <div className="text-center py-12">
              <TrendingDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? 'Aucun résultat pour votre recherche' : 
                  statusFilter === 'all' ? 'Aucune demande trouvée' : `Aucune demande ${getStatusLabel(statusFilter).toLowerCase()}`}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? `Essayez avec d'autres termes de recherche ou modifiez vos filtres.` :
                  statusFilter === 'all' 
                    ? 'Vous n\'avez encore fait aucune demande de vente d\'actions.' 
                    : `Vous n'avez aucune demande avec le statut "${getStatusLabel(statusFilter).toLowerCase()}".`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginationData.currentItems.map((demande) => (
                <div key={demande.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {getStatusIcon(demande.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(demande.status)}`}>
                          {getStatusLabel(demande.status)}
                        </span>
                        <span className="ml-auto text-xl font-bold text-gray-900">
                          {formatAmount(demande.montant_total)}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-blue-600">
                          Vente de {demande.nombre_actions} action{demande.nombre_actions > 1 ? 's' : ''}
                        </span>
                        <span className="text-gray-400 hidden sm:inline">•</span>
                        <span className="text-sm text-gray-600">
                          Prix unitaire: {formatAmount(demande.prix_unitaire)}
                        </span>
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="font-medium w-20">Date:</span> 
                          <span>{formatDate(demande.date_demande)}</span>
                        </div>
                        {demande.date_traitement && (
                          <div className="flex items-center">
                            <span className="font-medium w-20">Traitement:</span> 
                            <span>{formatDate(demande.date_traitement)}</span>
                          </div>
                        )}
                        <div className="flex items-center md:col-span-2">
                          <span className="font-medium w-20">Motif:</span> 
                          <span className="text-gray-900">{demande.motif}</span>
                        </div>
                        
                        {demande.commentaire_admin && (
                          <div className="flex items-center md:col-span-2">
                            <span className="font-medium w-20">Commentaire:</span> 
                            <span className="text-gray-900 bg-gray-100 px-3 py-1 rounded">
                              {demande.commentaire_admin}
                            </span>
                          </div>
                        )}
                        
                        <div className="md:col-span-2 flex items-center">
                          <span className="font-medium w-20">ID Demande:</span> 
                          <span className="font-mono text-xs bg-blue-50 px-2 py-1 rounded text-blue-600 overflow-auto max-w-full">
                            {demande.id}
                          </span>
                          <button
                            onClick={() => navigator.clipboard.writeText(demande.id)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                            title="Copier l'ID de la demande"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {paginationData.totalPages > 1 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Affichage de {paginationData.startIndex + 1} à {Math.min(paginationData.endIndex, paginationData.totalItems)} sur {paginationData.totalItems} demande(s)
                {statusFilter !== 'all' && ` (${getStatusLabel(statusFilter).toLowerCase()})`}
                {searchTerm && ` avec recherche "${searchTerm}"`}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={!paginationData.hasPrevPage}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Première page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationData.hasPrevPage}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Page précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={index} className="px-3 py-2 text-gray-400">...</span>
                    ) : (
                      <button
                        key={index}
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationData.hasNextPage}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Page suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handlePageChange(paginationData.totalPages)}
                  disabled={!paginationData.hasNextPage}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Dernière page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm">
                <div className="text-gray-600">
                  Page {currentPage} sur {paginationData.totalPages}
                </div>
                <div className="font-medium text-gray-700">
                  Total montant filtré: {formatAmount(
                    filteredAndSortedDemandes
                      .filter(d => d.status === 'approved')
                      .reduce((sum, d) => sum + d.montant_total, 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer sans pagination */}
        {paginationData.totalPages <= 1 && paginationData.currentItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
               Affichage de {paginationData.totalItems} demande(s)
                {statusFilter !== 'all' && ` (${getStatusLabel(statusFilter).toLowerCase()})`}
                {searchTerm && ` avec recherche "${searchTerm}"`}
              </div>
              <div className="font-medium">
                Total montant affiché: {formatAmount(
                  filteredAndSortedDemandes
                    .filter(d => d.status === 'approved')
                    .reduce((sum, d) => sum + d.montant_total, 0)
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section d'information */}
      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Informations sur le processus de vente</h3>
            <p className="text-sm text-gray-600">
              Vos demandes de vente d'actions sont examinées par notre équipe avant d'être approuvées. 
              Une fois approuvée, le montant sera transféré sur votre dividende selon les modalités établies. 

            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0" />
                <span>En attente: Demande en cours d'examen</span>
              </div>
              <div className="flex items-center p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                <span>Approuvée: Paiement en cours de traitement</span>
              </div>
              <div className="flex items-center p-2 bg-red-50 rounded-lg">
                <XCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                <span>Rejetée: Demande non validée (voir commentaire)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Portfolio actuel - Conditionnelle si les infos utilisateur sont disponibles */}
      {user_info && (user_info.actions_actuelles !== undefined || user_info.dividendes_actuels !== undefined) && (
        <div className="bg-white rounded-lg shadow p-4 mt-6">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Votre Portfolio Actuel
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user_info.actions_actuelles !== undefined && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Actions détenues</div>
                <div className="text-2xl font-bold text-blue-600">{user_info.actions_actuelles}</div>
              </div>
            )}
            {user_info.dividendes_actuels !== undefined && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Dividendes accumulés</div>
                <div className="text-2xl font-bold text-green-600">{formatAmount(user_info.dividendes_actuels)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MySalesListView;