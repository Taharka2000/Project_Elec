"use client";
import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  BarChart3,
  Minus,
  Share,
  X // Ajout de l'icône X
} from 'lucide-react';

interface Projection {
  _id: string;
  users: number;
  revenue: number;
  expenses: number;
  shares: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectionsListProps {
  projections: Projection[];
  formatAmount: (amount: number) => string;
  formatNumber: (number: number) => string;
  formatDate: (dateString: string) => string;
  calculateProfit: (projection: Projection) => number;
  calculateDividendPerShare: (projection: Projection) => number;
  currentFilter: string;
}

const ProjectionsList: React.FC<ProjectionsListProps> = ({
  projections,
  formatAmount,
  formatNumber,
  formatDate,
  calculateProfit,
  calculateDividendPerShare,
  currentFilter
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProjection, setSelectedProjection] = useState<Projection | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(projections.length / itemsPerPage);
  
  // Calculer les éléments de la page actuelle
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjections = projections.slice(startIndex, endIndex);

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Voir les détails d'une projection
  const handleViewDetails = (projection: Projection) => {
    setSelectedProjection(projection);
    setShowDetailModal(true);
  };

  // Fermer le modal de détails
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProjection(null);
  };

  // Fonction d'exportation
  const handleExport = (projectionId: string) => {
    console.log('Export projection:', projectionId);
    // Implémentez la logique d'exportation ici
  };

  // Obtenir la couleur du statut de profit
  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600';
    if (profit < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <>
      {/* Liste Desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateurs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dépenses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dividende/Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProjections.map((projection) => {
                const profit = calculateProfit(projection);
                const dividend = calculateDividendPerShare(projection);
                
                return (
                  <tr key={projection._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(projection.date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(projection.date).getFullYear()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatNumber(projection.users)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-sm font-medium text-green-600">
                          {formatAmount(projection.revenue)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Minus className="w-4 h-4 text-red-400 mr-2" />
                        <span className="text-sm font-medium text-red-600">
                          {formatAmount(projection.expenses)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TrendingUp className={`w-4 h-4 mr-2 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                        <span className={`text-sm font-medium ${getProfitColor(profit)}`}>
                          {formatAmount(profit)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Share className={`w-4 h-4 mr-2 ${dividend >= 0 ? 'text-purple-400' : 'text-red-400'}`} />
                        <span className={`text-sm font-medium ${dividend >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                          {formatAmount(dividend)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(projection)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExport(projection._id)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                          title="Exporter"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Liste Mobile */}
      <div className="lg:hidden space-y-4">
        {currentProjections.map((projection) => {
          const profit = calculateProfit(projection);
          const dividend = calculateDividendPerShare(projection);
          
          return (
            <div key={projection._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <span className="font-medium text-gray-900">{formatDate(projection.date)}</span>
                    <div className="text-xs text-gray-500">{new Date(projection.date).getFullYear()}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(projection)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExport(projection._id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-blue-400 mr-2" />
                  <div>
                    <span className="text-gray-600">Utilisateurs</span>
                    <div className="font-medium">{formatNumber(projection.users)}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-green-400 mr-2" />
                  <div>
                    <span className="text-gray-600">Revenus</span>
                    <div className="font-medium text-green-600">{formatAmount(projection.revenue)}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <TrendingUp className={`w-4 h-4 mr-2 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                  <div>
                    <span className="text-gray-600">Profit</span>
                    <div className={`font-medium ${getProfitColor(profit)}`}>{formatAmount(profit)}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Share className={`w-4 h-4 mr-2 ${dividend >= 0 ? 'text-purple-400' : 'text-red-400'}`} />
                  <div>
                    <span className="text-gray-600">Dividende</span>
                    <div className={`font-medium ${dividend >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                      {formatAmount(dividend)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                <span className="font-medium">{Math.min(endIndex, projections.length)}</span> sur{' '}
                <span className="font-medium">{projections.length}</span> projections
              </p>
            </div>
            
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailModal && selectedProjection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Détails de la Projection
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedProjection.date)} - {new Date(selectedProjection.date).getFullYear()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Métriques principales */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Users className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">Utilisateurs</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{formatNumber(selectedProjection.users)}</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Share className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-800">Actions</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{formatNumber(selectedProjection.shares)}</p>
                  </div>
                </div>

                {/* Financials */}
                <div className="space-y-4">
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">Chiffre d'affaires</span>
                      </div>
                      <span className="text-xl font-bold text-green-900">{formatAmount(selectedProjection.revenue)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Minus className="w-5 h-5 text-red-600 mr-2" />
                        <span className="font-medium text-red-800">Dépenses</span>
                      </div>
                      <span className="text-xl font-bold text-red-900">{formatAmount(selectedProjection.expenses)}</span>
                    </div>
                  </div>
                  
                  <div className={`border-l-4 p-4 ${calculateProfit(selectedProjection) >= 0 ? 'bg-yellow-50 border-yellow-400' : 'bg-red-50 border-red-400'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className={`w-5 h-5 mr-2 ${calculateProfit(selectedProjection) >= 0 ? 'text-yellow-600' : 'text-red-600'}`} />
                        <span className={`font-medium ${calculateProfit(selectedProjection) >= 0 ? 'text-yellow-800' : 'text-red-800'}`}>Profit</span>
                      </div>
                      <span className={`text-xl font-bold ${calculateProfit(selectedProjection) >= 0 ? 'text-yellow-900' : 'text-red-900'}`}>
                        {formatAmount(calculateProfit(selectedProjection))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dividende par action */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white text-center">
                  <h4 className="text-lg font-semibold mb-2">Dividende par Action</h4>
                  <p className="text-3xl font-bold">{formatAmount(calculateDividendPerShare(selectedProjection))}</p>
                </div>

                {/* Métadonnées */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Informations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Créé le :</span>
                      <span className="ml-2 font-medium">{formatDate(selectedProjection.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Modifié le :</span>
                      <span className="ml-2 font-medium">{formatDate(selectedProjection.updatedAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ID :</span>
                      <span className="ml-2 font-mono text-xs">{selectedProjection._id}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleExport(selectedProjection._id)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </button>
                  <button
                    onClick={closeDetailModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectionsList;