// app/admin/actionnaires/_components/CreateActionnaireModal.tsx
"use client";
import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Share, 
  Save, 
  UserPlus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface CreateActionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isPending: boolean;
  onCreateActionnaire: (data: CreateActionnaireForm) => Promise<void>;
}

interface CreateActionnaireForm {
  firstName: string;
  lastName: string;
  telephone: string;
  nbre_actions: number;
}

const CreateActionnaireModal: React.FC<CreateActionnaireModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isPending,
  onCreateActionnaire
}) => {
  const [formData, setFormData] = useState<CreateActionnaireForm>({
    firstName: '',
    lastName: '',
    telephone: '',
    nbre_actions: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      telephone: '',
      nbre_actions: 0
    });
    setErrors({});
    setMessage(null);
  };

  // Fermer le modal
  const handleClose = () => {
    if (!isPending) {
      resetForm();
      onClose();
    }
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? (value === '' ? 0 : Number(value))
        : value || ''
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
    
    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    }
    
    if (!formData.lastName || !formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
    }
    
    if (!formData.telephone || !formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!/^[\+]?[0-9\s\-\(\)]{8,15}$/.test(formData.telephone.trim())) {
      newErrors.telephone = 'Format de téléphone invalide (8-15 chiffres)';
    }
    
    if (typeof formData.nbre_actions !== 'number' || formData.nbre_actions < 0) {
      newErrors.nbre_actions = 'Le nombre d\'actions ne peut pas être négatif';
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
      await onCreateActionnaire({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        telephone: formData.telephone.trim(),
        nbre_actions: formData.nbre_actions
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Actionnaire créé avec succès ! Un message WhatsApp a été envoyé avec les informations de connexion.' 
      });
      
      // Attendre un peu pour que l'utilisateur voie le message de succès
      setTimeout(() => {
        resetForm();
        onSuccess();
        onClose();
      }, 2000);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors de la création de l\'actionnaire' 
      });
    }
  };

  // Auto-hide message après 5 secondes
  React.useEffect(() => {
    if (message && message.type === 'error') {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Créer un nouvel actionnaire
              </h2>
              <p className="text-sm text-gray-600">
                Les informations de connexion seront envoyées par WhatsApp
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

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isPending}
                  placeholder="Entrez le prénom"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isPending}
                  placeholder="Entrez le nom"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  disabled={isPending}
                  placeholder="77 123 45 67"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.telephone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.telephone && (
                <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Les informations de connexion seront envoyées sur WhatsApp
              </p>
            </div>

            {/* Nombre d'actions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre d'actions
              </label>
              <div className="relative">
                <Share className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="nbre_actions"
                  value={formData.nbre_actions}
                  onChange={handleInputChange}
                  disabled={isPending}
                  min="0"
                  placeholder="0"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.nbre_actions ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.nbre_actions && (
                <p className="text-red-500 text-xs mt-1">{errors.nbre_actions}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Les dividendes seront calculés automatiquement
              </p>
            </div>
          </div>

          {/* Informations importantes */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              ℹ️ Informations importantes
            </h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Un mot de passe temporaire sera généré automatiquement</li>
              <li>• Les informations de connexion seront envoyées par WhatsApp</li>
              <li>• L'utilisateur devra changer son mot de passe lors de la première connexion</li>
              <li>• Les dividendes seront calculés selon la formule de l'entreprise</li>
            </ul>
          </div>

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
              disabled={isPending}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isPending ? 'Création...' : 'Créer l\'actionnaire'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateActionnaireModal;