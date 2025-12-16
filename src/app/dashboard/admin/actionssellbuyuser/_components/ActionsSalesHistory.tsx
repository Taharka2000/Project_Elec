"use client";
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp,
  Download,
  AlertCircle,
  User,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowRightLeft,
  Users,
  Search,
  X
} from 'lucide-react';

// Types
interface UserInfo {
  _id: string;
  firstName: string;
  lastName: string;
  telephone: string;
  nbre_actions: number;
  fullName?: string;
  valeurPortefeuille: number;
  id: string;
}

interface ActionTransaction {
  _id: string;
  vendeur: UserInfo;
  acheteur: UserInfo;
  nbre_actions: number;
  montant: number;
  telephone_acheteur: string;
  telephone_vendeur: string;
  date_transaction: string;
  __v?: number;
}

interface ActionsSalesHistoryProps {
  user_info?: {
    id: string;
    firstName: string;
    lastName: string;
    telephone: string;
  };
  transactions?: ActionTransaction[];
}

const ActionsSalesHistory: React.FC<ActionsSalesHistoryProps> = ({ 
  user_info,
  transactions = [] 
}) => {
  const [filterType, setFilterType] = useState<'all' | 'vendeur' | 'acheteur'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'actions'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserFullName = (user: UserInfo): string => {
    return `${user.firstName} ${user.lastName}`;
  };

  const isUserVendeur = (transaction: ActionTransaction): boolean => {
    if (!user_info) return false;
    return transaction.telephone_vendeur === user_info.telephone;
  };

  const isUserAcheteur = (transaction: ActionTransaction): boolean => {
    if (!user_info) return false;
    return transaction.telephone_acheteur === user_info.telephone;
  };

  // Filtrer et trier les transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filtre par type (vendeur/acheteur)
    if (user_info && filterType !== 'all') {
      filtered = filtered.filter(transaction => {
        if (filterType === 'vendeur') {
          return isUserVendeur(transaction);
        } else if (filterType === 'acheteur') {
          return isUserAcheteur(transaction);
        }
        return true;
      });
    }

    // Filtre par recherche
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(transaction => {
        const vendeurName = getUserFullName(transaction.vendeur).toLowerCase();
        const acheteurName = getUserFullName(transaction.acheteur).toLowerCase();
        const telVendeur = transaction.telephone_vendeur.toLowerCase();
        const telAcheteur = transaction.telephone_acheteur.toLowerCase();
        const montant = transaction.montant.toString();
        const nbreActions = transaction.nbre_actions.toString();
        const transactionId = transaction._id.toLowerCase();
        
        return (
          vendeurName.includes(query) ||
          acheteurName.includes(query) ||
          telVendeur.includes(query) ||
          telAcheteur.includes(query) ||
          montant.includes(query) ||
          nbreActions.includes(query) ||
          transactionId.includes(query)
        );
      });
    }

    // Tri
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.date_transaction).getTime() - new Date(b.date_transaction).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.montant - b.montant;
      } else if (sortBy === 'actions') {
        comparison = a.nbre_actions - b.nbre_actions;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [transactions, filterType, sortBy, sortOrder, searchQuery, user_info]);

  // Calculer les données de pagination
  const paginationData = useMemo(() => {
    const totalItems = filteredAndSortedTransactions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredAndSortedTransactions.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentItems,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [filteredAndSortedTransactions, currentPage, itemsPerPage]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const asVendeur = transactions.filter(t => user_info && isUserVendeur(t));
    const asAcheteur = transactions.filter(t => user_info && isUserAcheteur(t));
    
    return {
      total: transactions.length,
      asVendeur: asVendeur.length,
      asAcheteur: asAcheteur.length,
      totalActions: transactions.reduce((sum, t) => sum + t.nbre_actions, 0),
      totalMontant: transactions.reduce((sum, t) => sum + t.montant, 0),
      montantVendu: asVendeur.reduce((sum, t) => sum + t.montant, 0),
      montantAchete: asAcheteur.reduce((sum, t) => sum + t.montant, 0),
      actionsVendues: asVendeur.reduce((sum, t) => sum + t.nbre_actions, 0),
      actionsAchetees: asAcheteur.reduce((sum, t) => sum + t.nbre_actions, 0)
    };
  }, [transactions, user_info]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: 'all' | 'vendeur' | 'acheteur') => {
    setFilterType(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Vendeur', 'Téléphone Vendeur', 'Acheteur', 'Téléphone Acheteur', 'Nombre Actions', 'Prix Unitaire', 'Montant Total'].join(','),
      ...filteredAndSortedTransactions.map(t => [
        new Date(t.date_transaction).toLocaleDateString('fr-FR'),
        `"${getUserFullName(t.vendeur)}"`,
        t.telephone_vendeur,
        `"${getUserFullName(t.acheteur)}"`,
        t.telephone_acheteur,
        t.nbre_actions,
        (t.montant / t.nbre_actions).toFixed(2),
        t.montant
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ventes_actions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600 flex items-center">
          <TrendingUp className="w-8 h-8 mr-3" />
          Historique des Ventes d'Actions
        </h1>
        <p className="text-gray-600 mt-1">
          {user_info ? (
            `Bonjour ${user_info.firstName} ${user_info.lastName}, voici l'historique des ventes d'actions entre utilisateurs`
          ) : (
            'Historique des ventes d\'actions entre utilisateurs'
          )}
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        {user_info && (
          <>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Vendues</p>
                  <p className="text-lg font-bold text-green-600">{formatActions(stats.actionsVendues)} actions</p>
                  <p className="text-xs text-gray-500">{formatAmount(stats.montantVendu)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-purple-100">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Achetées</p>
                  <p className="text-lg font-bold text-purple-600">{formatActions(stats.actionsAchetees)} actions</p>
                  <p className="text-xs text-gray-500">{formatAmount(stats.montantAchete)}</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-orange-100">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Volume Total</p>
              <p className="text-lg font-bold text-orange-600">{formatActions(stats.totalActions)} actions</p>
              <p className="text-xs text-gray-500">{formatAmount(stats.totalMontant)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <div className="bg-white rounded-lg shadow mb-6">
        {/* Barre de recherche */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, montant, actions ou ID..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Effacer la recherche"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              {filteredAndSortedTransactions.length} résultat(s) trouvé(s) pour "{searchQuery}"
            </p>
          )}
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {user_info && (
                <div className="flex items-center">
                  <Filter className="w-4 h-4 text-gray-500 mr-2" />
                  <label className="text-sm font-medium text-gray-700 mr-2">Filtrer:</label>
                  <select
                    value={filterType}
                    onChange={(e) => handleFilterChange(e.target.value as 'all' | 'vendeur' | 'acheteur')}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Toutes</option>
                    <option value="vendeur">Mes ventes</option>
                    <option value="acheteur">Mes achats</option>
                  </select>
                </div>
              )}

              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 mr-2">Trier par:</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy as 'date' | 'amount' | 'actions');
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date-desc">Date (récent)</option>
                  <option value="date-asc">Date (ancien)</option>
                  <option value="amount-desc">Montant (élevé)</option>
                  <option value="amount-asc">Montant (faible)</option>
                  <option value="actions-desc">Actions (élevé)</option>
                  <option value="actions-asc">Actions (faible)</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 mr-2">Par page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <button
              onClick={exportToCSV}
              disabled={filteredAndSortedTransactions.length === 0}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV ({filteredAndSortedTransactions.length})
            </button>
          </div>
        </div>

        {/* Liste des transactions */}
        <div className="p-4">
          {paginationData.currentItems.length === 0 ? (
            <div className="text-center py-12">
              <ArrowRightLeft className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchQuery ? 'Aucun résultat trouvé' : 'Aucune transaction'}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? `Aucune transaction ne correspond à "${searchQuery}"`
                  : 'Aucune vente d\'actions n\'a été effectuée pour le moment.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginationData.currentItems.map((transaction) => {
                const isVendeur = user_info && isUserVendeur(transaction);
                const isAcheteur = user_info && isUserAcheteur(transaction);
                const prixUnitaire = transaction.montant / transaction.nbre_actions;

                return (
                  <div key={transaction._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${isVendeur ? 'bg-green-100' : isAcheteur ? 'bg-purple-100' : 'bg-gray-100'}`}>
                          <ArrowRightLeft className={`w-5 h-5 ${isVendeur ? 'text-green-600' : isAcheteur ? 'text-purple-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          {isVendeur && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                              Vous avez vendu
                            </span>
                          )}
                          {isAcheteur && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200">
                              Vous avez acheté
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{formatAmount(transaction.montant)}</p>
                        <p className="text-sm text-gray-500">{formatActions(transaction.nbre_actions)} actions</p>
                        <p className="text-xs text-gray-400">{formatAmount(prixUnitaire)}/action</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {/* Vendeur */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center mb-2">
                          <User className="w-4 h-4 text-green-600 mr-1" />
                          <span className="font-medium text-green-600">Vendeur</span>
                        </div>
                        <p className="font-semibold text-gray-900">{getUserFullName(transaction.vendeur)}</p>
                        <p className="text-gray-600 font-mono text-xs">{transaction.telephone_vendeur}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Actions restantes: {formatActions(transaction.vendeur.nbre_actions)}
                        </p>
                      </div>

                      {/* Acheteur */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center mb-2">
                          <User className="w-4 h-4 text-purple-600 mr-1" />
                          <span className="font-medium text-purple-600">Acheteur</span>
                        </div>
                        <p className="font-semibold text-gray-900">{getUserFullName(transaction.acheteur)}</p>
                        <p className="text-gray-600 font-mono text-xs">{transaction.telephone_acheteur}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Actions actuelles: {formatActions(transaction.acheteur.nbre_actions)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(transaction.date_transaction)}</span>
                      </div>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        ID: {transaction._id.slice(-8)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {paginationData.totalPages > 1 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Affichage de {paginationData.startIndex + 1} à {Math.min(paginationData.endIndex, paginationData.totalItems)} sur {paginationData.totalItems} transaction(s)
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
                  Total des montants (toutes pages): {formatAmount(
                    filteredAndSortedTransactions.reduce((sum, t) => sum + t.montant, 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionsSalesHistory;