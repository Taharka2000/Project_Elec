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
  TrendingUp
} from 'lucide-react';

// Types adaptés à votre nouvelle structure
interface Transaction {
  id: string;
  paydunya_transaction_id: string;
  utilisateur: {
    id: string;
    nom: string;
    telephone: string;
    actions_actuelles: number;
    dividendes_actuels: number;
  };
  nombre_actions: number;
  prix_unitaire: number;
  montant_total: number;
  status: 'completed' | 'pending' | 'failed';
  paydunya_status: 'completed' | 'pending' | 'failed';
  payment_method: string;
  payment_date: string;
  dividende_calculated: number;
  created_at: string;
  updated_at: string;
}

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
}

interface TransactionsViewProps {
  user_info?: UserInfo;
  transactions?: Transaction[];
}

const TransactionsAdaptedView: React.FC<TransactionsViewProps> = ({ 
  user_info,
  transactions = [] 
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Fonction pour obtenir la couleur de méthode de paiement
  const getPaymentMethodColor = (method: string) => {
    if (!method) return 'Méthode inconnue';
    switch (method) {
      case 'orange_money_senegal':
      case 'orange-money-senegal':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'wave_senegal':
      case 'wave-senegal':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'free_money_senegal':
      case 'free-money-senegal':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Fonction pour obtenir le label de méthode de paiement
  const getPaymentMethodLabel = (method: string) => {
    if (!method) return 'Méthode inconnue';
    switch (method) {
      case 'orange_money_senegal':
      case 'orange-money-senegal':
        return 'Orange Money Sénégal';
      case 'wave_senegal':
      case 'wave-senegal':
        return 'Wave Sénégal';
      case 'free_money_senegal':
      case 'free-money-senegal':
        return 'Free Money Sénégal';
      default:
        return method.split(/[-_]/).map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
  };

  // Fonction pour obtenir l'icône de méthode de paiement
  const getPaymentMethodIcon = (method: string) => {
    if (!method) return 'Méthode inconnue';
    switch (method) {
      case 'orange_money_senegal':
      case 'orange-money-senegal':
        return '🟠';
      case 'wave_senegal':
      case 'wave-senegal':
        return '🌊';
      case 'free_money_senegal':
      case 'free-money-senegal':
        return '🆓';
      default:
        return '💳';
    }
  };

  // Fonction pour obtenir le label de statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complétée';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échouée';
      default:
        return status;
    }
  };

  // Filtrer et trier les transactions (avec useMemo pour optimiser)
  const filteredAndSortedTransactions = useMemo(() => {
    const filtered = transactions.filter(transaction => {
      if (statusFilter === 'all') return true;
      return transaction.status === statusFilter;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.montant_total - b.montant_total;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [transactions, statusFilter, sortBy, sortOrder]);

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
  const stats = {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    totalAmount: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.montant_total, 0),
    totalActions: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.nombre_actions, 0)
  };

  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonction pour changer le nombre d'éléments par page
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // Réinitialiser la page lors du changement de filtre
  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  // Fonction d'export CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Date Transaction', 'ID Transaction', 'ID Paydunya', 'Utilisateur', 'Téléphone', 'Nombre Actions', 'Prix Unitaire', 'Montant Total', 'Statut', 'Méthode Paiement', 'Date Paiement', 'Dividende Calculé'].join(','),
      ...filteredAndSortedTransactions.map(t => [
        new Date(t.created_at).toLocaleDateString('fr-FR'),
        t.id,
        t.paydunya_transaction_id,
        `"${t.utilisateur.nom}"`,
        t.utilisateur.telephone,
        t.nombre_actions,
        t.prix_unitaire,
        t.montant_total,
        getStatusLabel(t.status),
        getPaymentMethodLabel(t.payment_method),
        t.payment_date ? new Date(t.payment_date).toLocaleDateString('fr-FR') : '',
        t.dividende_calculated
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_actions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-800">Debug Info:</h3>
          <p className="text-sm text-yellow-700">
            Transactions count: {transactions.length} | Filtered: {filteredAndSortedTransactions.length} | Page: {currentPage}/{paginationData.totalPages}
          </p>
          <p className="text-sm text-yellow-700">
            User info: {user_info ? 'Loaded' : 'Missing'} | Items per page: {itemsPerPage}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600 flex items-center">
          <TrendingUp className="w-8 h-8 mr-3" />
          Historique des Transactions d'Actions
        </h1>
        <p className="text-gray-600 mt-1">
          {user_info ? (
            `Bonjour ${user_info.firstName} ${user_info.lastName}, voici l'historique de vos transactions d'actions`
          ) : (
            'Voici l\'historique des transactions d\'actions'
          )}
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Complétées</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-100">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Actions Achetées</p>
              <p className="text-xl font-bold text-green-600">{stats.totalActions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Montant Total</p>
              <p className="text-lg font-bold text-green-600">{formatAmount(stats.totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center">
                <Filter className="w-4 h-4 text-gray-500 mr-2" />
                <label className="text-sm font-medium text-gray-700 mr-2">Statut:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous</option>
                  <option value="completed">Complétées</option>
                  <option value="pending">En attente</option>
                  <option value="failed">Échouées</option>
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
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
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
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {statusFilter === 'all' ? 'Aucune transaction' : `Aucune transaction ${getStatusLabel(statusFilter).toLowerCase()}`}
              </h3>
              <p className="text-gray-500">
                {statusFilter === 'all' 
                  ? 'Vous n\'avez encore effectué aucune transaction.' 
                  : `Vous n'avez aucune transaction avec le statut "${getStatusLabel(statusFilter).toLowerCase()}".`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginationData.currentItems.map((transaction) => (
                <div key={transaction.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        {getStatusIcon(transaction.status)}
                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                          {getStatusLabel(transaction.status)}
                        </span>
                        <span className="ml-auto text-xl font-bold text-gray-900">
                          {formatAmount(transaction.montant_total)}
                        </span>
                      </div>
                     
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="text-sm text-blue-600 mr-2">
                          Achat de {transaction.nombre_actions} action{transaction.nombre_actions > 1 ? 's' : ''}
                          
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="ml-2 text-sm text-gray-600">
                          Prix unitaire: {formatAmount(transaction.prix_unitaire)}
                        </span>
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        
                        <div className="flex items-center">
                          <span className="font-medium w-20">Méthode:</span> 
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentMethodColor(transaction.payment_method)}`}>
                            {getPaymentMethodIcon(transaction.payment_method)} {getPaymentMethodLabel(transaction.payment_method)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-20">Date:</span> 
                          <span>{formatDate(transaction.created_at)}</span>
                        </div>
                        
                        {transaction.payment_date && (
                          <div className="flex items-center">
                            <span className="font-medium w-20">Paiement:</span> 
                            <span>{formatDate(transaction.payment_date)}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <span className="font-medium w-20">Dividende:</span> 
                          <span className="font-bold text-green-600">{formatAmount(transaction.dividende_calculated)}</span>
                        </div>
                         <div className="flex items-center">
                          <span className="font-medium w-20">Téléphone:</span> 
                       
                        </div>
                        <div className="md:col-span-2 flex items-center">
                          <span className="font-medium w-20">ID Trans:</span> 
                          <span className="font-mono text-xs bg-blue-50 px-2 py-1 rounded text-blue-600">
                            {transaction.id}
                          </span>
                        </div>
                        
                        {transaction.paydunya_transaction_id && (
                          <div className="md:col-span-2 flex items-center">
                            <span className="font-medium w-20">Paydunya:</span> 
                            <span className="font-mono text-xs bg-green-50 px-2 py-1 rounded text-green-600">
                              {transaction.paydunya_transaction_id}
                            </span>
                            <button
                              onClick={() => navigator.clipboard.writeText(transaction.paydunya_transaction_id)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                              title="Copier l'ID Paydunya"
                            >
                              📋
                            </button>
                          </div>
                        )}
                       
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
                Affichage de {paginationData.startIndex + 1} à {Math.min(paginationData.endIndex, paginationData.totalItems)} sur {paginationData.totalItems} transaction(s)
                {statusFilter !== 'all' && ` (${getStatusLabel(statusFilter).toLowerCase()})`}
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
                  Total montant complété: {formatAmount(
                    filteredAndSortedTransactions
                      .filter(t => t.status === 'completed')
                      .reduce((sum, t) => sum + t.montant_total, 0)
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
                Affichage de {paginationData.totalItems} transaction(s)
                {statusFilter !== 'all' && ` (${getStatusLabel(statusFilter).toLowerCase()})`}
              </div>
              <div className="font-medium">
                Total montant complété: {formatAmount(
                  filteredAndSortedTransactions
                    .filter(t => t.status === 'completed')
                    .reduce((sum, t) => sum + t.montant_total, 0)
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsAdaptedView;