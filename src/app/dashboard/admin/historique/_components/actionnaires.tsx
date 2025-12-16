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
  ChevronsRight
} from 'lucide-react';

// Types
interface Transaction {
  _id: string;
  type: string;
  amount: number;
  userId: {
    _id: string;
    telephone: string;
  } | string | null;
  recipientPhone: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  reference: string;
  createdAt: string;
  id_transaction?: string;
  paydounyaTransactionId?: string;
  token?: string;
  isRefunded?: boolean;
  __v?: number;
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

const TransactionsOnlyView: React.FC<TransactionsViewProps> = ({ 
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
    switch (method) {
      case 'orange-money-senegal':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'wave-senegal':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'free-money-senegal':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Fonction pour obtenir le label de méthode de paiement
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'orange-money-senegal':
        return 'Orange Money Sénégal';
      case 'wave-senegal':
        return 'Wave Sénégal';
      case 'free-money-senegal':
        return 'Free Money Sénégal';
      default:
        return method.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
  };

  // Fonction pour obtenir l'icône de méthode de paiement
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'orange-money-senegal':
        return '🟠';
      case 'wave-senegal':
        return '🌊';
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

  // Fonction pour obtenir le type de transaction
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'dividend_withdrawal':
        return 'Retrait de dividendes';
      case 'dividend_deposit':
        return 'Dépôt de dividendes';
      case 'refund':
        return 'Remboursement';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
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
      .reduce((sum, t) => sum + t.amount, 0)
  };

  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll vers le haut lors du changement de page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonction pour changer le nombre d'éléments par page
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Revenir à la première page
  };

  // Réinitialiser la page lors du changement de filtre
  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  // Fonction d'export CSV (pour toutes les transactions filtrées)
  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Référence', 'Type', 'Description', 'Montant', 'Statut', 'Téléphone', 'Méthode', 'ID Transaction', 'ID Paydunya', 'Remboursé'].join(','),
      ...filteredAndSortedTransactions.map(t => [
        new Date(t.createdAt).toLocaleDateString('fr-FR'),
        t.reference,
        getTransactionTypeLabel(t.type),
        `"${t.description}"`,
        t.amount,
        getStatusLabel(t.status),
        `+221${t.recipientPhone}`,
        getPaymentMethodLabel(t.paymentMethod),
        t.id_transaction || '',
        t.paydounyaTransactionId || '',
        t.isRefunded ? 'Oui' : 'Non'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_dividendes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const { totalPages } = paginationData;
    const delta = 2; // Nombre de pages à afficher de chaque côté de la page actuelle
    const pages: (number | string)[] = [];

    // Toujours afficher la première page
    pages.push(1);

    // Calculer la plage autour de la page actuelle
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    // Ajouter "..." si nécessaire
    if (start > 2) {
      pages.push('...');
    }

    // Ajouter les pages autour de la page actuelle
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Ajouter "..." si nécessaire
    if (end < totalPages - 1) {
      pages.push('...');
    }

    // Toujours afficher la dernière page (si différente de la première)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Debug Info - à supprimer une fois que ça marche */}
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
          <FileText className="w-8 h-8 mr-3" />
          Historique des Retraits de Dividendes
        </h1>
        <p className="text-gray-600 mt-1">
          {user_info ? (
            `Bonjour ${user_info.firstName} ${user_info.lastName}, voici l'historique de vos retraits de dividendes`
          ) : (
            'Voici l\'historique des retraits de dividendes'
          )}
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
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
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Montant total retiré</p>
              <p className="text-xl font-bold text-green-600">{formatAmount(stats.totalAmount)}</p>
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
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                <div key={transaction._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        {getStatusIcon(transaction.status)}
                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                          {getStatusLabel(transaction.status)}
                        </span>
                        {transaction.isRefunded && (
                          <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                            Remboursé
                          </span>
                        )}
                        <span className="ml-auto text-xl font-bold text-gray-900">
                          {formatAmount(transaction.amount)}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="text-sm text-blue-600 mr-2">
                          {getTransactionTypeLabel(transaction.type)}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="ml-2">{transaction.description}</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="font-medium w-20">Référence:</span> 
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{transaction.reference}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-20">Téléphone:</span> 
                          <span className="font-mono">+221{transaction.recipientPhone}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-20">Méthode:</span> 
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentMethodColor(transaction.paymentMethod)}`}>
                            {getPaymentMethodIcon(transaction.paymentMethod)} {getPaymentMethodLabel(transaction.paymentMethod)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-20">Date:</span> 
                          <span>{formatDate(transaction.createdAt)}</span>
                        </div>
                        {transaction.id_transaction && (
                          <div className="md:col-span-2 flex items-center">
                            <span className="font-medium w-20">ID Trans:</span> 
                            <span className="font-mono text-xs bg-blue-50 px-2 py-1 rounded text-blue-600">
                              {transaction.id_transaction}
                            </span>
                          </div>
                        )}
                        {transaction.paydounyaTransactionId && (
                          <div className="md:col-span-2 flex items-center">
                            <span className="font-medium w-20">Paydunya:</span> 
                            <span className="font-mono text-xs bg-green-50 px-2 py-1 rounded text-green-600">
                              {transaction.paydounyaTransactionId}
                            </span>
                            <button
                              onClick={() => navigator.clipboard.writeText(transaction.paydounyaTransactionId!)}
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
              {/* Informations de pagination */}
              <div className="text-sm text-gray-600">
                Affichage de {paginationData.startIndex + 1} à {Math.min(paginationData.endIndex, paginationData.totalItems)} sur {paginationData.totalItems} transaction(s)
                {statusFilter !== 'all' && ` (${getStatusLabel(statusFilter).toLowerCase()})`}
              </div>

              {/* Contrôles de pagination */}
              <div className="flex items-center space-x-2">
                {/* Bouton première page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={!paginationData.hasPrevPage}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Première page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Bouton page précédente */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationData.hasPrevPage}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Page précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Numéros de pages */}
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

                {/* Bouton page suivante */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationData.hasNextPage}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Page suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Bouton dernière page */}
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

            {/* Résumé des montants pour la page actuelle */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm">
                <div className="text-gray-600">
                  Page {currentPage} sur {paginationData.totalPages}
                </div>
                <div className="font-medium text-gray-700">
                  Total des montants complétés (toutes pages): {formatAmount(
                    filteredAndSortedTransactions
                      .filter(t => t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer avec résumé (quand pas de pagination) */}
        {paginationData.totalPages <= 1 && paginationData.currentItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                Affichage de {paginationData.totalItems} transaction(s)
                {statusFilter !== 'all' && ` (${getStatusLabel(statusFilter).toLowerCase()})`}
              </div>
              <div className="font-medium">
                Total des montants complétés: {formatAmount(
                  filteredAndSortedTransactions
                    .filter(t => t.status === 'completed')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsOnlyView;