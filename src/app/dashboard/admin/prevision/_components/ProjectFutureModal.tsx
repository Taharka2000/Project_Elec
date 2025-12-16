"use client";
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  TrendingUp,
  Save, 
  Calculator,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  ArrowRight,
  Target
} from 'lucide-react';

interface ProjectFutureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isPending: boolean;
  onProjectFuture: (data: ProjectFutureForm) => Promise<any>;
  existingProjections: any[];
}

interface ProjectFutureForm {
  fromYear: number;
  toYear: number;
  projectedUsers: number;
}

interface ProjectionResult {
  fromYear: number;
  toYear: number;
  growthFactor: number;
  current: {
    users: number;
    revenue: number;
    expenses: number;
    profit: number;
  };
  projection: {
    users: number;
    revenue: number;
    expenses: number;
    profit: number;
    dividendPerAction: number;
  };
}

const ProjectFutureModal: React.FC<ProjectFutureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isPending,
  onProjectFuture,
  existingProjections
}) => {
  const [formData, setFormData] = useState<ProjectFutureForm>({
    fromYear: new Date().getFullYear(),
    toYear: new Date().getFullYear() + 1,
    projectedUsers: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [projectionResult, setProjectionResult] = useState<ProjectionResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Années disponibles basées sur les projections existantes
  const availableYears = React.useMemo(() => {
    const years = existingProjections.map(p => new Date(p.date).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }, [existingProjections]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      fromYear: new Date().getFullYear(),
      toYear: new Date().getFullYear() + 1,
      projectedUsers: 0
    });
    setErrors({});
    setMessage(null);
    setProjectionResult(null);
    setShowResult(false);
  };

  // Fermer le modal
  const handleClose = () => {
    if (!isPending) {
      resetForm();
      onClose();
    }
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'projectedUsers' ? (value === '' ? 0 : Number(value)) : Number(value)
    }));
    
    // Supprimer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (message) {
      setMessage(null);
    }
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!availableYears.includes(formData.fromYear)) {
      newErrors.fromYear = 'Année de référence non disponible dans les projections';
    }
    
    if (formData.toYear <= formData.fromYear) {
      newErrors.toYear = 'L\'année cible doit être postérieure à l\'année de référence';
    }
    
    if (formData.toYear > new Date().getFullYear() + 10) {
      newErrors.toYear = 'L\'année cible ne peut pas être trop éloignée (max +10 ans)';
    }
    
    if (!formData.projectedUsers || formData.projectedUsers <= 0) {
      newErrors.projectedUsers = 'Le nombre d\'utilisateurs projetés doit être supérieur à 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await onProjectFuture(formData);
      
      if (result.type === 'success' && result.data) {
        setProjectionResult(result.data);
        setShowResult(true);
        setMessage({ 
          type: 'success', 
          text: 'Projection future calculée avec succès !' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message || 'Erreur lors du calcul de la projection' 
        });
      }
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors du calcul de la projection future' 
      });
    }
  };

  // Confirmer et sauvegarder la projection
  const handleConfirmProjection = () => {
    setMessage({ 
      type: 'success', 
      text: 'Projection future sauvegardée avec succès !' 
    });
    
    setTimeout(() => {
      resetForm();
      onSuccess();
      onClose();
    }, 2000);
  };

  // Auto-hide message après 5 secondes
  React.useEffect(() => {
    if (message && message.type === 'error') {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Formater les montants pour l'affichage
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Formater les nombres
  const formatNumber = (number: number): string => {
    return new Intl.NumberFormat('fr-FR').format(number);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Calculator className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Projection Future
              </h2>
              <p className="text-sm text-gray-600">
                Projeter les performances futures basées sur les données existantes
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            disabled={isPending}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Message de notification */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {!showResult ? (
          /* Formulaire de projection */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Année de référence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Année de référence <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    name="fromYear"
                    value={formData.fromYear}
                    onChange={handleInputChange}
                    disabled={isPending}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.fromYear ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                {errors.fromYear && (
                  <p className="text-red-500 text-xs mt-1">{errors.fromYear}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Année servant de base au calcul
                </p>
              </div>

              {/* Année cible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Année cible <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    name="toYear"
                    value={formData.toYear}
                    onChange={handleInputChange}
                    disabled={isPending}
                    min={formData.fromYear + 1}
                    max={new Date().getFullYear() + 10}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.toYear ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.toYear && (
                  <p className="text-red-500 text-xs mt-1">{errors.toYear}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Année pour laquelle projeter
                </p>
              </div>

              {/* Utilisateurs projetés */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utilisateurs projetés <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    name="projectedUsers"
                    value={formData.projectedUsers}
                    onChange={handleInputChange}
                    disabled={isPending}
                    min="1"
                    placeholder="20000"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.projectedUsers ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.projectedUsers && (
                  <p className="text-red-500 text-xs mt-1">{errors.projectedUsers}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Nombre d'utilisateurs attendus
                </p>
              </div>
            </div>

            {/* Informations sur l'algorithme */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-800 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Algorithme de projection
              </h4>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• <strong>Facteur de croissance :</strong> Utilisateurs projetés ÷ Utilisateurs de référence</li>
                <li>• <strong>Revenus projetés :</strong> Revenus de référence × Facteur de croissance × 2</li>
                <li>• <strong>Dépenses projetées :</strong> Revenus projetés ÷ 6</li>
                <li>• <strong>Profit projeté :</strong> Revenus projetés - Dépenses projetées</li>
                <li>• <strong>Dividende :</strong> Profit projeté ÷ Nombre d'actions</li>
              </ul>
            </div>

            {availableYears.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Aucune projection disponible
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Vous devez d'abord créer au moins une projection de base pour pouvoir utiliser cette fonctionnalité.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || availableYears.length === 0}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Calculator className="w-4 h-4 mr-2" />
                {isPending ? 'Calcul...' : 'Calculer la projection'}
              </button>
            </div>
          </div>
        ) : (
          /* Résultats de la projection */
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                <CheckCircle className="w-4 h-4 mr-2" />
                Projection calculée avec succès
              </div>
            </div>

            {projectionResult && (
              <>
                {/* En-tête de comparaison */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Données actuelles */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Année {projectionResult.fromYear}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Utilisateurs:</span>
                        <span className="font-medium text-blue-900">{formatNumber(projectionResult.current.users)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Revenus:</span>
                        <span className="font-medium text-blue-900">{formatAmount(projectionResult.current.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Dépenses:</span>
                        <span className="font-medium text-blue-900">{formatAmount(projectionResult.current.expenses)}</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-200 pt-2">
                        <span className="text-sm font-medium text-blue-700">Profit:</span>
                        <span className="font-bold text-blue-900">{formatAmount(projectionResult.current.profit)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Flèche et facteur de croissance */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-3 bg-purple-100 rounded-full mb-2">
                      <ArrowRight className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Facteur de croissance</p>
                      <p className="text-2xl font-bold text-purple-600">×{projectionResult.growthFactor.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Données projetées */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Année {projectionResult.toYear}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Utilisateurs:</span>
                        <span className="font-medium text-green-900">{formatNumber(projectionResult.projection.users)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Revenus:</span>
                        <span className="font-medium text-green-900">{formatAmount(projectionResult.projection.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Dépenses:</span>
                        <span className="font-medium text-green-900">{formatAmount(projectionResult.projection.expenses)}</span>
                      </div>
                      <div className="flex justify-between border-t border-green-200 pt-2">
                        <span className="text-sm font-medium text-green-700">Profit:</span>
                        <span className="font-bold text-green-900">{formatAmount(projectionResult.projection.profit)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dividende par action mis en évidence */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-6 h-6 mr-2" />
                    <h3 className="text-xl font-bold">Dividende par Action Projeté</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{formatAmount(projectionResult.projection.dividendPerAction)}</p>
                  <p className="text-purple-100">pour l'année {projectionResult.toYear}</p>
                </div>

                {/* Comparaison des performances */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Évolution prévue</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Croissance Utilisateurs</p>
                      <p className="text-lg font-bold text-blue-600">
                        +{((projectionResult.projection.users - projectionResult.current.users) / projectionResult.current.users * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Croissance Revenus</p>
                      <p className="text-lg font-bold text-green-600">
                        +{((projectionResult.projection.revenue - projectionResult.current.revenue) / projectionResult.current.revenue * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Croissance Profit</p>
                      <p className="text-lg font-bold text-yellow-600">
                        +{((projectionResult.projection.profit - projectionResult.current.profit) / projectionResult.current.profit * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Marge Nette</p>
                      <p className="text-lg font-bold text-purple-600">
                        {(projectionResult.projection.profit / projectionResult.projection.revenue * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Boutons d'action pour les résultats */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowResult(false)}
                disabled={isPending}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Modifier les paramètres
              </button>
              <button
                type="button"
                onClick={handleConfirmProjection}
                disabled={isPending}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder cette projection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectFutureModal;