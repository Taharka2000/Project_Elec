// app/admin/actionnaires/_components/AddNewYearModal.tsx - Version corrigée
"use client";
import React, { useState, useRef } from 'react';
import { 
  X, 
  Calendar, 
  DollarSign, 
  FileText, 
  Save, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Building2,
  Upload,
  File,
  Download
} from 'lucide-react';

interface AddNewYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isPending: boolean;
  onAddNewYear: (data: FormData | any) => Promise<any>; // Accepte FormData ou objet simple
}

interface NewYearForm {
  annee: number;
  total_benefice: number;
  rapport: string;
}

const AddNewYearModal: React.FC<AddNewYearModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isPending,
  onAddNewYear
}) => {
  const currentYear = new Date().getFullYear();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<NewYearForm>({
    annee: currentYear,
    total_benefice: 0,
    rapport: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      annee: currentYear,
      total_benefice: 0,
      rapport: ''
    });
    setSelectedFile(null);
    setErrors({});
    setMessage(null);
    setSuccessData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fermer le modal
  const handleClose = () => {
    if (!isPending) {
      resetForm();
      onClose();
    }
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    
    // Supprimer le message si l'utilisateur modifie le formulaire
    if (message) {
      setMessage(null);
    }
  };

  // Gérer la sélection de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          file: 'Le fichier ne peut pas dépasser 10MB'
        }));
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          file: 'Format de fichier non supporté. Utilisez PDF, DOC, DOCX, XLS, XLSX ou TXT'
        }));
        return;
      }

      setSelectedFile(file);
      // Supprimer l'erreur de fichier s'il y en avait une
      if (errors.file) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      }
    }
  };

  // Supprimer le fichier sélectionné
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.annee || formData.annee < 2020 || formData.annee > 2100) {
      newErrors.annee = 'Année invalide (doit être entre 2020 et 2100)';
    }
    
    if (!formData.total_benefice || formData.total_benefice <= 0) {
      newErrors.total_benefice = 'Le bénéfice doit être supérieur à 0';
    } else if (formData.total_benefice > 1000000000) {
      newErrors.total_benefice = 'Le bénéfice semble anormalement élevé';
    }
    
    // Le rapport textuel ou le fichier est optionnel, mais on peut en exiger au moins un
    if (!formData.rapport.trim() && !selectedFile) {
      newErrors.rapport = 'Un rapport textuel ou un fichier est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formater les montants
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculer le dividende estimé par action
  const calculateDividendPerAction = (): number => {
    if (formData.total_benefice <= 0) return 0;
    return formData.total_benefice / 100000; // Formule: benefice / 100000 pour 1 action
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Télécharger le fichier depuis la réponse de succès
  const handleDownloadFile = () => {
    if (successData?.fichier?.urlTelecharger) {
      window.open(successData.fichier.urlTelecharger, '_blank');
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let dataToSubmit;

      // Décider si on envoie FormData ou objet simple
      if (selectedFile) {
        // Avec fichier : FormData
        const formDataToSubmit = new FormData();
        formDataToSubmit.append('annee', formData.annee.toString());
        formDataToSubmit.append('total_benefice', formData.total_benefice.toString());
        
        // Ajouter le rapport textuel seulement s'il y en a un
        if (formData.rapport.trim()) {
          formDataToSubmit.append('rapport_text', formData.rapport.trim());
        }
        
        // Ajouter le fichier
        formDataToSubmit.append('rapport', selectedFile);
        dataToSubmit = formDataToSubmit;
      } else {
        // Sans fichier : objet simple
        dataToSubmit = {
          annee: formData.annee,
          total_benefice: formData.total_benefice,
          rapport: formData.rapport.trim()
        };
      }


      
      const result = await onAddNewYear(dataToSubmit);
      

      
      // Vérifier que le résultat est bien un objet avec type
      if (!result || typeof result !== 'object') {
        throw new Error("Réponse invalide du serveur");
      }
      
      if (result.type === 'success') {
        setSuccessData(result);
        setMessage({ 
          type: 'success', 
          text: `Nouvelle année ${formData.annee} ajoutée avec succès ! Les dividendes ont été recalculés pour tous les actionnaires.` 
        });
        
        // Attendre un peu pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          onSuccess();
          // Ne pas fermer automatiquement pour permettre le téléchargement
        }, 2000);
      } else if (result.type === 'error') {
        setMessage({ 
          type: 'error', 
          text: result.message || 'Erreur lors de l\'ajout de la nouvelle année' 
        });
      } else {
        // Si pas de type défini, traiter comme erreur
        setMessage({ 
          type: 'error', 
          text: result.message || 'Erreur inconnue lors de l\'ajout de la nouvelle année' 
        });
      }
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erreur lors de l\'ajout de la nouvelle année' 
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
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Ajouter une nouvelle année
              </h2>
              <p className="text-sm text-gray-600">
                Enregistrer les bénéfices et uploader le rapport annuel
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                <span>{message.text}</span>
              </div>
              {message.type === 'success' && successData?.fichier?.urlTelecharger && (
                <button
                  onClick={handleDownloadFile}
                  className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Télécharger
                </button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Année */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="annee"
                  value={formData.annee}
                  onChange={handleInputChange}
                  disabled={isPending}
                  min="2020"
                  max="2100"
                  placeholder={currentYear.toString()}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.annee ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.annee && (
                <p className="text-red-500 text-xs mt-1">{errors.annee}</p>
              )}
            </div>

            {/* Bénéfice total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bénéfice total (FCFA) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="total_benefice"
                  value={formData.total_benefice}
                  onChange={handleInputChange}
                  disabled={isPending}
                  min="0"
                  step="1000"
                  placeholder="Entrez le bénéfice total"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.total_benefice ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.total_benefice && (
                <p className="text-red-500 text-xs mt-1">{errors.total_benefice}</p>
              )}
              {formData.total_benefice > 0 && (
                <p className="text-xs text-purple-600 mt-1">
                  Montant formaté: {formatAmount(formData.total_benefice)}
                </p>
              )}
            </div>
          </div>

          {/* Upload de fichier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichier rapport (PDF, DOC, Excel...) <span className="text-gray-500">(optionnel)</span>
            </label>
            
            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Cliquez pour uploader ou glissez votre fichier ici
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX, XLS, XLSX, TXT (max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  disabled={isPending}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  Choisir un fichier
                </button>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <File className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={isPending}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            
            {errors.file && (
              <p className="text-red-500 text-xs mt-1">{errors.file}</p>
            )}
          </div>

          {/* Rapport/Commentaire textuel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commentaire sur l'année <span className="text-gray-500">(optionnel si fichier uploadé)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                name="rapport"
                value={formData.rapport}
                onChange={handleInputChange}
                disabled={isPending}
                rows={4}
                maxLength={1000}
                placeholder="Décrivez les résultats de l'année, les projets réalisés, les perspectives..."
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
                  errors.rapport ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.rapport && (
              <p className="text-red-500 text-xs mt-1">{errors.rapport}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.rapport.length}/1000 caractères
            </p>
          </div>

          {/* Aperçu des calculs */}
          {formData.total_benefice > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Aperçu des dividendes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700">
                <div>
                  <p className="font-medium">Formule de calcul:</p>
                  <p className="font-mono">dividende = bénéfice × nbre_actions ÷ 100,000</p>
                </div>
                <div>
                  <p className="font-medium">Dividende par action:</p>
                  <p className="font-mono">{formatAmount(calculateDividendPerAction())}</p>
                </div>
              </div>
              <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                <p>• Les dividendes seront <strong>additionnés</strong> aux dividendes existants</p>
                <p>• Tous les actionnaires seront automatiquement mis à jour</p>
                <p>• Le fichier sera stocké et accessible pour téléchargement</p>
              </div>
            </div>
          )}

          {/* Résumé du succès avec info fichier */}
          {successData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">
                ✅ Année ajoutée avec succès
              </h4>
              <div className="text-xs text-green-700 space-y-1">
                <p>• Actionnaires mis à jour: {successData.resumeDividendes?.totalActionnaires}</p>
                <p>• Nouveaux dividendes distribués: {successData.resumeDividendes?.nouveauxDividendesDistribues} FCFA</p>
                {successData.fichier && (
                  <p>• Fichier uploadé: {successData.fichier.nom}</p>
                )}
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
              {successData ? 'Fermer' : 'Annuler'}
            </button>
            {!successData && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {isPending ? 'Enregistrement...' : `Enregistrer l'année ${formData.annee}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewYearModal;