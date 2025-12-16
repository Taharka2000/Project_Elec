"use client";
import React, { useState } from 'react';
import { 
  X, 
  Users, 
  DollarSign, 
  Minus, 
  Share,
  Save, 
  Plus,
  AlertCircle,
  CheckCircle,
  Calculator,
  Info,
  Loader2
} from 'lucide-react';
import { 
  formatAmount, 
  calculateProfit, 
  calculateDividendPerShare,
  validateProjectionData 
} from '@/lib/projectionUtils';

interface AddProjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isPending: boolean;
  onAddProjection: (data: AddProjectionForm) => Promise<any>;
}

interface AddProjectionForm {
  users: number;
  revenue: number;
  expenses: number;
  shares: number;
}

const AddProjectionModal: React.FC<AddProjectionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isPending,
  onAddProjection
}) => {
  const [formData, setFormData] = useState<AddProjectionForm>({
    users: 0,
    revenue: 0,
    expenses: 0,
    shares: 100000 // Valeur par défaut
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculer automatiquement le profit et dividende en utilisant les utilitaires
  const projectionData = {
    ...formData,
    revenue: formData.revenue || 0,
    expenses: formData.expenses || 0,
    shares: formData.shares || 100000
  };
  
  const profit = calculateProfit(projectionData);
  const dividendPerShare = calculateDividendPerShare(projectionData);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      users: 0,
      revenue: 0,
      expenses: 0,
      shares: 100000
    });
    setErrors({});
    setMessage(null);
    setIsSubmitting(false);
  };

  // Fermer le modal
  const handleClose = () => {
    if (!isPending && !isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // Gérer les changements dans le formulaire avec validation en temps réel
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const numericValue = value === '' ? 0 : Number(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));
    
    // Supprimer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Effacer le message si l'utilisateur tape
    if (message) {
      setMessage(null);
    }
  };

  // Validation en temps réel des dépenses vs revenus
  const expensesWarning = React.useMemo(() => {
    if (formData.revenue > 0 && formData.expenses > 0) {
      const ratio = (formData.expenses / formData.revenue) * 100;
      if (ratio > 90) {
        return {
          type: 'error' as const,
          text: `Attention: Les dépenses représentent ${ratio.toFixed(1)}% des revenus`
        };
      } else if (ratio > 70) {
        return {
          type: 'warning' as const,
          text: `Les dépenses représentent ${ratio.toFixed(1)}% des revenus`
        };
      }
    }
    return null;
  }, [formData.revenue, formData.expenses]);

  // Suggestions automatiques pour les actions
  const sharesSuggestion = React.useMemo(() => {
    if (formData.users > 0) {
      const suggestedShares = Math.round(formData.users * 10); // 10 actions par utilisateur
      if (suggestedShares !== formData.shares && suggestedShares > 1000) {
        return suggestedShares;
      }
    }
    return null;
  }, [formData.users, formData.shares]);

  // Soumettre le formulaire avec validation améliorée
  const handleSubmit = async () => {
    // Utiliser la fonction de validation des utilitaires
    const validation = validateProjectionData(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setMessage({
        type: 'error',
        text: 'Veuillez corriger les erreurs dans le formulaire'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await onAddProjection(formData);
      
      if (result && result.type === 'success') {
        setMessage({ 
          type: 'success', 
          text: result.message || 'Projection créée avec succès !' 
        });
        
        // Attendre un peu pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          resetForm();
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: result?.message || 'Erreur lors de la création de la projection' 
        });
        setIsSubmitting(false);
      }
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors de la création de la projection' 
      });
      setIsSubmitting(false);
    }
  };

  // Appliquer la suggestion d'actions
  const applySuggestion = () => {
    if (sharesSuggestion) {
      setFormData(prev => ({ ...prev, shares: sharesSuggestion }));
    }
  };

  // Auto-hide message après 5 secondes (seulement pour les erreurs)
  React.useEffect(() => {
    if (message && message.type === 'error') {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isOpen) return null;

  const isLoading = isPending || isSubmitting;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Nouvelle Projection
              </h2>
              <p className="text-sm text-gray-600">
                Créer une projection financière
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
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
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre d'utilisateurs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre d'utilisateurs <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="users"
                  value={formData.users || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  min="1"
                  placeholder="10000"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    errors.users ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.users && (
                <p className="text-red-500 text-xs mt-1">{errors.users}</p>
              )}
            </div>

            {/* Chiffre d'affaires */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chiffre d'affaires (XOF) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="revenue"
                  value={formData.revenue || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  min="1"
                  placeholder="50000000"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    errors.revenue ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.revenue && (
                <p className="text-red-500 text-xs mt-1">{errors.revenue}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Revenus prévus pour cette projection
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dépenses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dépenses (XOF) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Minus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="expenses"
                  value={formData.expenses || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  min="0"
                  placeholder="8000000"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    errors.expenses ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.expenses && (
                <p className="text-red-500 text-xs mt-1">{errors.expenses}</p>
              )}
              
              {/* Avertissement ratio dépenses/revenus */}
              {expensesWarning && (
                <p className={`text-xs mt-1 ${
                  expensesWarning.type === 'error' ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {expensesWarning.text}
                </p>
              )}
              
              {!expensesWarning && (
                <p className="text-xs text-gray-500 mt-1">
                  Dépenses prévues (doivent être &lt; revenus)
                </p>
              )}
            </div>

            {/* Nombre d'actions avec suggestion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre d'actions
                {sharesSuggestion && (
                  <button
                    type="button"
                    onClick={applySuggestion}
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Suggérer {new Intl.NumberFormat('fr-FR').format(sharesSuggestion)}
                  </button>
                )}
              </label>
              <div className="relative">
                <Share className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="shares"
                  value={formData.shares || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  min="1"
                  placeholder="100000"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    errors.shares ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.shares && (
                <p className="text-red-500 text-xs mt-1">{errors.shares}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Total des actions en circulation
              </p>
            </div>
          </div>

          {/* Calculs automatiques améliorés */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              Calculs automatiques
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profit :</span>
                  <span className={`font-semibold text-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(profit)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Revenus - Dépenses</p>
                {formData.revenue > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Marge: {((profit / formData.revenue) * 100).toFixed(1)}%
                  </p>
                )}
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dividende/Action :</span>
                  <span className={`font-semibold text-sm ${dividendPerShare >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(dividendPerShare)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Profit ÷ Nombre d'actions</p>
                {formData.users > 0 && formData.shares > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {(formData.shares / formData.users).toFixed(1)} actions/utilisateur
                  </p>
                )}
              </div>
            </div>
            
            {profit < 0 && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                <span className="text-xs text-red-700">
                  Attention : Cette projection génère une perte de {formatAmount(Math.abs(profit))}. Vérifiez vos chiffres.
                </span>
              </div>
            )}
          </div>

          {/* Informations importantes */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Informations importantes
            </h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Cette projection sera enregistrée avec la date actuelle</li>
              <li>• Le profit est calculé automatiquement (Revenus - Dépenses)</li>
              <li>• Le dividende par action est calculé (Profit ÷ Nombre d'actions)</li>
              <li>• Ces données pourront être utilisées pour les projections futures</li>
            </ul>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || profit < 0}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[140px] justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Création...' : 'Créer la projection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectionModal;