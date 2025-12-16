"use client";
import React, { useState, useTransition } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  Plus,
  Calculator,
  Calendar,
  AlertCircle,
  CheckCircle,
  BarChart3,
  FileText,
  Download,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  formatAmount, 
  formatNumber, 
  formatDate, 
  calculateProfit, 
  calculateDividendPerShare,
  filterProjectionsByPeriod,
  downloadCsvFile,
  prepareCsvData
} from '@/lib/projectionUtils';
import ProjectionsList from './ProjectionsList';
import AddProjectionModal from './AddProjectionModal';
import ProjectFutureModal from './ProjectFutureModal';

// Types
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

interface ProjectionStats {
  total_projections: number;
  latest_year: number | null;
  total_revenue_projected: number;
  total_profit_projected: number;
  average_dividend_per_share: number;
}

interface ProjectionsAdminViewProps {
  projections?: Projection[];
  statistiques?: ProjectionStats;
}

const ProjectionsAdminView: React.FC<ProjectionsAdminViewProps> = ({ 
  projections = [], 
  statistiques = {
    total_projections: 0,
    latest_year: null,
    total_revenue_projected: 0,
    total_profit_projected: 0,
    average_dividend_per_share: 0
  }
}) => {
  const router = useRouter();
  
  const [filter, setFilter] = useState<'all' | 'recent' | 'old'>('all');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Fonction pour exporter en CSV
  const handleExportCSV = async () => {
    try {
      const csvData = prepareCsvData(filteredProjections);
      downloadCsvFile(csvData.content, csvData.filename);
      setMessage({ 
        type: 'success', 
        text: 'Export CSV téléchargé avec succès !' 
      });
    } catch (error) {
      console.error('Erreur export CSV:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors de l\'export CSV' 
      });
    }
  };

  // Ajouter une nouvelle projection
  const handleAddProjection = async (formData: any) => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const { addProjection } = await import('@/actions/projectionActions');
          const result = await addProjection(formData);

          if (result.type === 'success') {
            setMessage({ 
              type: 'success', 
              text: result.message 
            });
            setTimeout(() => {
              router.refresh();
            }, 1000);
          } else {
            setMessage({ 
              type: 'error', 
              text: result.message || 'Erreur lors de l\'ajout de la projection' 
            });
          }
          
          resolve(result);
        } catch (error) {
          console.error("Erreur dans handleAddProjection:", error);
          const errorResult = {
            type: "error",
            message: "Erreur lors de l'ajout de la projection"
          };
          setMessage({ type: 'error', text: errorResult.message });
          resolve(errorResult);
        }
      });
    });
  };

  // Créer une projection future
  const handleProjectFuture = async (formData: any) => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const { projectFuture } = await import('@/actions/projectionActions');
          const result = await projectFuture(formData);

          if (result.type === 'success') {
            setMessage({ 
              type: 'success', 
              text: result.message 
            });
            setTimeout(() => {
              router.refresh();
            }, 1000);
          } else {
            setMessage({ 
              type: 'error', 
              text: result.message || 'Erreur lors de la création de la projection future' 
            });
          }
          
          resolve(result);
        } catch (error) {
          console.error("Erreur dans handleProjectFuture:", error);
          const errorResult = {
            type: "error",
            message: "Erreur lors de la création de la projection future"
          };
          setMessage({ type: 'error', text: errorResult.message });
          resolve(errorResult);
        }
      });
    });
  };

  // Filtrer les projections avec vérification de sécurité
  const filteredProjections = React.useMemo(() => {
    return filterProjectionsByPeriod(projections, filter);
  }, [projections, filter]);

  // Auto-hide message après 5 secondes
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Calculer les totaux pour le résumé avec sécurité
  const summaryData = React.useMemo(() => {
    if (!Array.isArray(filteredProjections)) {
      return {
        totalRevenue: 0,
        totalProfit: 0
      };
    }

    return {
      totalRevenue: filteredProjections.reduce((sum, p) => sum + (p?.revenue || 0), 0),
      totalProfit: filteredProjections.reduce((sum, p) => sum + calculateProfit(p), 0)
    };
  }, [filteredProjections]);

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Message de notification */}
      {message && (
        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
            )}
            <span className="text-sm sm:text-base">{message.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Projections Financières</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Gestion des prévisions et projections futures</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowProjectModal(true)}
              disabled={isPending}
              className="flex items-center justify-center px-3 lg:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Calculator className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Projeter le futur</span>
              <span className="lg:hidden">Projeter</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={isPending}
              className="flex items-center justify-center px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Nouvelle projection</span>
              <span className="lg:hidden">Nouvelle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-100">
              <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Projections</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistiques.total_projections}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-100">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Revenus Total</p>
              <p className="text-sm sm:text-2xl font-bold text-gray-900 truncate">{formatAmount(statistiques.total_revenue_projected)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-yellow-100">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Profit Total</p>
              <p className="text-sm sm:text-2xl font-bold text-gray-900 truncate">{formatAmount(statistiques.total_profit_projected)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-purple-100">
              <Target className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Dividende Moy</p>
              <p className="text-sm sm:text-xl font-bold text-gray-900 truncate">{formatAmount(statistiques.average_dividend_per_share)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-red-100">
              <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Dernière Année</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistiques.latest_year || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({projections.length})
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                filter === 'recent' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Récentes
            </button>
            <button
              onClick={() => setFilter('old')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                filter === 'old' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Anciennes
            </button>
          </div>

          {/* Actions rapides */}
          <div className="flex space-x-2">
            <button 
              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
              onClick={handleExportCSV}
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </button>
            <button 
              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
              onClick={() => console.log('Export PDF à implémenter')}
            >
              <FileText className="w-4 h-4 mr-1" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Indication si pas de projections */}
      {filteredProjections.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' 
              ? 'Aucune projection disponible' 
              : `Aucune projection ${filter === 'recent' ? 'récente' : 'ancienne'}`
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? 'Commencez par créer votre première projection financière.' 
              : 'Essayez de changer le filtre pour voir d\'autres projections.'
            }
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer ma première projection
            </button>
          )}
        </div>
      ) : (
        /* Liste des projections */
        <ProjectionsList
          projections={filteredProjections}
          formatAmount={formatAmount}
          formatNumber={formatNumber}
          formatDate={formatDate}
          calculateProfit={calculateProfit}
          calculateDividendPerShare={calculateDividendPerShare}
          currentFilter={filter}
        />
      )}

      {/* Modal d'ajout de projection */}
      <AddProjectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setMessage({ type: 'success', text: 'Projection ajoutée avec succès !' });
          router.refresh();
        }}
        isPending={isPending}
        onAddProjection={handleAddProjection}
      />

      {/* Modal de projection future */}
      <ProjectFutureModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSuccess={() => {
          setMessage({ type: 'success', text: 'Projection future créée avec succès !' });
          router.refresh();
        }}
        isPending={isPending}
        onProjectFuture={handleProjectFuture}
        existingProjections={projections}
      />

      {/* Résumé en bas */}
      <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Résumé des Projections {filter !== 'all' && `(${filter === 'recent' ? 'Récentes' : 'Anciennes'})`}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm sm:text-base">Nombre de projections:</span>
                <span className="font-semibold text-sm sm:text-base">{filteredProjections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm sm:text-base">Revenus totaux projetés:</span>
                <span className="font-semibold text-sm sm:text-base">
                  {formatAmount(summaryData.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm sm:text-base">Profits totaux projetés:</span>
                <span className="font-semibold text-sm sm:text-base">
                  {formatAmount(summaryData.totalProfit)}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions Rapides</h3>
            <div className="space-y-2">
              <button 
                className="w-full flex items-center justify-start px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded transition-colors"
                onClick={() => setShowProjectModal(true)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Créer une projection future
              </button>
              <button 
                className="w-full flex items-center justify-start px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                onClick={() => console.log('Analyse des tendances à implémenter')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Analyser les tendances
              </button>
              <button 
                className="w-full flex items-center justify-start px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                onClick={handleExportCSV}
              >
                <FileText className="w-4 h-4 mr-2" />
                Exporter rapport complet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectionsAdminView;