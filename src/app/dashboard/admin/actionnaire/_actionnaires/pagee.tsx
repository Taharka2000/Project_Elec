"use client";
import React, { useState, useTransition } from 'react';
import { 
  Share, 
  DollarSign, 
  Users, 
  UserCheck, 
  UserX,
  UserPlus,
  Calendar, 
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  Edit3,
  X,
  Save,
  User,
  Phone,
  Mail,
  Menu,
  ChevronDown,
  Trash2,  // ← Nouvelle icône pour la suppression
  UserMinus  // ← Nouvelle icône pour la suppression multiple
} from 'lucide-react';
import { 
  toggleActionnaireStatus, 
  recalculateAllDividendes, 
  updateUserInfo, 
  createNewActionnaire, 
  addNewYearBenefices,
  deleteUser,  // ← Nouvelle action pour la suppression
  deleteMultipleUsers,  // ← Nouvelle action pour la suppression multiple // ← Nouvelle fonction utilitaire
} from '@/actions/actionnaire';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import CreateActionnaireModal from './CreateActionnaireModal';
import AddNewYearModal from './AddNewYearModal';
import ActionnairesList from './ActionnairesList';

// Types (ajout de selectedUsers)
interface Actionnaire {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  nbre_actions: number;
  dividende_actuel: number;
  dividende: number;
  isBlocked: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Statistiques {
  nombre_total_actionnaires: number;
  actionnaires_actifs: number;
  actionnaires_bloques: number;
  total_actions: number;
  total_dividendes: number;
}

interface EntrepriseInfo {
  annee: number;
  benefice: number;
  formule: string;
  rapport: string;
  mode_calcul?: 'annee_unique' | 'cumule';
}

interface AnneeInfo {
  annee: number;
  benefice: number;
  rapport: string;
  createdAt: string;
}

interface ResumeGlobal {
  nombre_annees: number;
  total_benefices_toutes_annees: number;
  premiere_annee: number | null;
  derniere_annee: number | null;
  moyenne_benefice_par_annee: number;
}

interface ActionnairesAdminViewProps {
  actionnaires: Actionnaire[];
  statistiques: Statistiques;
  entreprise_info: EntrepriseInfo | null;
  toutes_annees: AnneeInfo[];
  resume_global: ResumeGlobal;
}

interface EditForm {
  firstName: string;
  lastName: string;
  telephone: string;
  dividende: number;
  nbre_actions: number;
  isBlocked: boolean;
}

const ActionnairesAdminView: React.FC<ActionnairesAdminViewProps> = ({ 
  actionnaires, 
  statistiques, 
  entreprise_info,
  toutes_annees,
  resume_global
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const selectedYear = searchParams.get('annee') ? Number(searchParams.get('annee')) : 'all';
  
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNewYearModal, setShowNewYearModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Actionnaire | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    firstName: '',
    lastName: '',
    telephone: '',
    nbre_actions: 0,
    dividende: 0,
    isBlocked: false
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ← NOUVEAUX ÉTATS pour la gestion de la sélection
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Fonction pour formater les montants
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fonction pour formater le nombre d'actions
  const formatActions = (actions: number): string => {
    return new Intl.NumberFormat('fr-FR').format(actions);
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ← NOUVELLES FONCTIONS pour la gestion de la sélection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    const allUserIds = filteredActionnaires.map(user => user.id);
    setSelectedUsers(allUserIds);
  };

  const clearSelection = () => {
    setSelectedUsers([]);
    setIsSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedUsers([]);
    }
  };

  // ← NOUVELLE FONCTION pour supprimer un utilisateur unique
  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      // Demander confirmation
   

      startTransition(async () => {
        try {
          const result = await deleteUser({ userId });

          if (result.type === 'success') {
            setMessage({ 
              type: 'success', 
              text: `${userName} a été supprimé avec succès` 
            });
            router.refresh();
          } else {
            setMessage({ type: 'error', text: result.message });
          }
        } catch (error) {
          setMessage({ 
            type: 'error', 
            text: 'Erreur lors de la suppression de l\'utilisateur' 
          });
        }
      });
    } catch (error) {
      console.error('Erreur suppression:', error);
      setMessage({ 
        type: 'error', 
        text: 'Une erreur est survenue lors de la suppression' 
      });
    }
  };

  // ← NOUVELLE FONCTION pour supprimer plusieurs utilisateurs
  const handleDeleteMultipleUsers = async () => {
    try {
      if (selectedUsers.length === 0) {
        setMessage({ type: 'error', text: 'Aucun utilisateur sélectionné' });
        return;
      }

    

      startTransition(async () => {
        try {
          const result = await deleteMultipleUsers({ userIds: selectedUsers });

          if (result.type === 'success') {
            const deletedCount = result.summary?.successfully_deleted || 0;
            const notFoundCount = result.summary?.not_found || 0;
            
            let message = `${deletedCount} utilisateur(s) supprimé(s) avec succès`;
            if (notFoundCount > 0) {
              message += ` (${notFoundCount} non trouvé(s))`;
            }
            
            setMessage({ type: 'success', text: message });
            
            // Réinitialiser la sélection
            clearSelection();
            router.refresh();
          } else {
            setMessage({ type: 'error', text: result.message });
          }
        } catch (error) {
          setMessage({ 
            type: 'error', 
            text: 'Erreur lors de la suppression multiple' 
          });
        }
      });
    } catch (error) {
      console.error('Erreur suppression multiple:', error);
      setMessage({ 
        type: 'error', 
        text: 'Une erreur est survenue lors de la suppression multiple' 
      });
    }
  };

  // Nouvelle fonction pour gérer le changement d'année
  const handleYearChange = (year: number | 'all') => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (year === 'all') {
      current.delete('annee');
    } else {
      current.set('annee', year.toString());
    }
    
    const search = current.toString();
    const query = search ? `?${search}` : '';
    
    router.push(`${pathname}${query}`);
  };

  const handleDownloadRapport = async (fileName: string, annee: number) => {
    try {
      setMessage({ type: 'success', text: `Téléchargement du rapport ${annee} en cours...` });
      
      // Utiliser l'endpoint existant pour télécharger
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/entreprises/download/${fileName}`;
      window.open(downloadUrl, '_blank');
      
      setMessage({ 
        type: 'success', 
        text: `Rapport de l'année ${annee} téléchargé avec succès !` 
      });

    } catch (error) {
      console.error('Erreur téléchargement rapport:', error);
      setMessage({ 
        type: 'error', 
        text: `Erreur lors du téléchargement du rapport ${annee}` 
      });
    }
  };

  // Ajouter une nouvelle année
  const handleAddNewYear = async (formData) => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const result = await addNewYearBenefices(formData);
          
          // S'assurer qu'on retourne toujours un objet avec type
          if (!result || typeof result !== 'object') {
            const errorResult = {
              type: "error",
              message: "Réponse invalide du serveur"
            };
            setMessage({ type: 'error', text: errorResult.message });
            resolve(errorResult);
            return;
          }
          
          // Si pas de type défini, traiter comme erreur
          if (!result.type) {
            const errorResult = {
              type: "error",
              message: result.message || "Erreur inconnue lors de l'ajout de la nouvelle année"
            };
            setMessage({ type: 'error', text: errorResult.message });
            resolve(errorResult);
            return;
          }
          
          // Traiter les résultats selon le type
          if (result.type === 'success') {
            setMessage({ type: 'success', text: result.message });
            // Attendre un peu avant de refresh pour que l'utilisateur voie le message
            setTimeout(() => {
              router.refresh();
            }, 1000);
          } else {
            setMessage({ type: 'error', text: result.message });
          }
          
          resolve(result);
          
        } catch (error) {
          console.error("Erreur dans handleAddNewYear:", error);
          const errorResult = {
            type: "error",
            message: error instanceof Error ? error.message : "Erreur lors de l'ajout de la nouvelle année"
          };
          setMessage({ type: 'error', text: errorResult.message });
          resolve(errorResult);
        }
      });
    });
  };

  const handleCreateActionnaire = async (formData) => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const result = await createNewActionnaire(formData);

          if (!result || typeof result !== 'object') {
            const errorResult = {
              type: "error",
              message: "Réponse invalide du serveur"
            };
            setMessage({ type: 'error', text: errorResult.message });
            resolve(errorResult);
            return;
          }

          if (result.type === 'success') {
            setMessage({ type: 'success', text: result.message });
            setTimeout(() => {
              router.refresh();
            }, 1000);
          } else {
            setMessage({ type: 'error', text: result.message });
          }
          
          resolve(result);
        } catch (error) {
          console.error("Erreur dans handleCreateActionnaire:", error);
          const errorResult = {
            type: "error",
            message: "Erreur lors de la création de l'actionnaire"
          };
          setMessage({ type: 'error', text: errorResult.message });
          resolve(errorResult);
        }
      });
    });
  };

  const handleEditUser = (actionnaire: Actionnaire) => {
    setEditingUser(actionnaire);
    setEditForm({
      firstName: actionnaire.firstName || '',
      lastName: actionnaire.lastName || '',
      telephone: actionnaire.telephone || '',
      nbre_actions: actionnaire.nbre_actions || 0,
      dividende: actionnaire.dividende_actuel || 0,
      isBlocked: actionnaire.isBlocked || false
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  // Fermer le modal d'édition
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditForm({
      firstName: '',
      lastName: '',
      telephone: '',
      nbre_actions: 0,
      dividende: 0,
      isBlocked: false
    });
    setEditErrors({});
  };

  // Gérer les changements dans le formulaire d'édition
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : type === 'number' 
          ? (value === '' ? 0 : Number(value))
          : value || ''
    }));
    
    // Supprimer l'erreur pour ce champ
    if (editErrors[name]) {
      setEditErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Sauvegarder les modifications
  const handleSaveUser = async () => {
    if (!editingUser) return;

    // Validation côté client avec vérifications de sécurité
    const errors: Record<string, string> = {};
    
    if (!editForm.firstName || !editForm.firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
    }
    if (!editForm.lastName || !editForm.lastName.trim()) {
      errors.lastName = 'Le nom est requis';
    }
   
    if (!editForm.telephone || !editForm.telephone.trim()) {
      errors.telephone = 'Le téléphone est requis';
    }
    if (typeof editForm.nbre_actions !== 'number' || editForm.nbre_actions < 0) {
      errors.nbre_actions = 'Le nombre d\'actions ne peut pas être négatif';
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    startTransition(async () => {
      try {
        // Construire les données à envoyer intelligemment
        const dataToSend: any = {
          userId: editingUser.id,
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          telephone: editForm.telephone.trim(),
          isBlocked: editForm.isBlocked
        };

        // Vérifier si nbre_actions a changé
        const actionsChanged = editForm.nbre_actions !== editingUser.nbre_actions;
        
        // Vérifier si dividende a changé
        const dividendeChanged = editForm.dividende !== editingUser.dividende_actuel;

        // Logique intelligente d'envoi
        if (actionsChanged && dividendeChanged) {
          // Les deux ont changé → Priorité aux actions (recalcul auto)
          dataToSend.nbre_actions = editForm.nbre_actions;
        
        } else if (actionsChanged) {
          // Seulement les actions ont changé → Recalcul auto
          dataToSend.nbre_actions = editForm.nbre_actions;
     
        } else if (dividendeChanged) {
          // Seulement le dividende a changé → Valeur manuelle
          dataToSend.dividende = editForm.dividende;
        
        }

        const result = await updateUserInfo(dataToSend);

        if (result.type === 'success') {
          setMessage({ type: 'success', text: result.message });
          closeEditModal();
          router.refresh();
        } else {
          if (result.errors) {
            setEditErrors(result.errors);
          } else {
            setMessage({ type: 'error', text: result.message });
          }
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
      }
    });
  };

  // Fonction pour basculer le statut d'un actionnaire
  const handleToggleStatus = async (actionnaireId: string, currentBlocked: boolean) => {
    startTransition(async () => {
      try {
        const result = await toggleActionnaireStatus({
          actionnaireId,
          isBlocked: !currentBlocked
        });

        if (result.type === 'success') {
          setMessage({ type: 'success', text: result.message });
          router.refresh();
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erreur lors du changement de statut' });
      }
    });
  };

  // Fonction pour recalculer tous les dividendes
  const handleRecalculateDividendes = async () => {
    startTransition(async () => {
      try {
        const result = await recalculateAllDividendes();

        if (result.type === 'success') {
          setMessage({ type: 'success', text: result.message });
          router.refresh();
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erreur lors du recalcul des dividendes' });
      }
    });
  };

  // Filtrer les actionnaires selon le filtre sélectionné
  const filteredActionnaires = React.useMemo(() => {
    return actionnaires.filter(actionnaire => {
      if (filter === 'active') return !actionnaire.isBlocked;
      if (filter === 'blocked') return actionnaire.isBlocked;
      return true;
    });
  }, [actionnaires, filter]);

  // Auto-hide message après 5 secondes
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Gestion des Actionnaires</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Administration et suivi des actions</p>
          </div>
          
          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Menu className="w-4 h-4 mr-2" />
              Actions
              <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Desktop buttons */}
          <div className="hidden sm:flex space-x-3">
            <button
              onClick={() => setShowNewYearModal(true)}
              disabled={isPending}
              className="flex items-center px-3 lg:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Nouvelle année</span>
              <span className="lg:hidden">Année</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={isPending}
              className="flex items-center px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Créer un actionnaire</span>
              <span className="lg:hidden">Créer</span>
            </button>
            
            {/* ← NOUVEAUX BOUTONS pour la sélection et suppression */}
            <button
              onClick={toggleSelectionMode}
              disabled={isPending}
              className={`flex items-center px-3 lg:px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm ${
                isSelectionMode 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserMinus className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">
                {isSelectionMode ? 'Annuler sélection' : 'Sélection multiple'}
              </span>
              <span className="lg:hidden">
                {isSelectionMode ? 'Annuler' : 'Sélection'}
              </span>
            </button>
           
          </div>
        </div>

        {/* Mobile action buttons */}
        {isMobileMenuOpen && (
          <div className="mt-4 sm:hidden space-y-2">
            <button
              onClick={() => {
                setShowNewYearModal(true);
                setIsMobileMenuOpen(false);
              }}
              disabled={isPending}
              className="w-full flex items-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Calendar className="w-4 h-4 mr-3" />
              Nouvelle année
            </button>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setIsMobileMenuOpen(false);
              }}
              disabled={isPending}
              className="w-full flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-3" />
              Créer un actionnaire
            </button>
            
            {/* ← NOUVEAUX BOUTONS MOBILE pour la sélection */}
            <button
              onClick={() => {
                toggleSelectionMode();
                setIsMobileMenuOpen(false);
              }}
              disabled={isPending}
              className={`w-full flex items-center px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isSelectionMode 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserMinus className="w-4 h-4 mr-3" />
              {isSelectionMode ? 'Annuler sélection' : 'Sélection multiple'}
            </button>
           
          </div>
        )}
      </div>

      {/* ← NOUVELLE BARRE pour la sélection multiple */}
      {isSelectionMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-800">
                Mode sélection activé - {selectedUsers.length} utilisateur(s) sélectionné(s)
              </span>
              {filteredActionnaires.length > 0 && (
                <button
                  onClick={selectAllUsers}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Tout sélectionner ({filteredActionnaires.length})
                </button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {selectedUsers.length > 0 && (
                <button
                  onClick={handleDeleteMultipleUsers}
                  disabled={isPending}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer ({selectedUsers.length})
                </button>
              )}
              <button
                onClick={clearSelection}
                disabled={isPending}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-100">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistiques.nombre_total_actionnaires}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-100">
              <UserCheck className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Actifs</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistiques.actionnaires_actifs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-red-100">
              <UserX className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Bloqués</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistiques.actionnaires_bloques}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6 col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-yellow-100">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Dividendes</p>
              <p className="text-sm sm:text-2xl font-bold text-gray-900 truncate">{formatAmount(statistiques.total_dividendes)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informations entreprise - Section condensée pour économiser l'espace */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Informations Entreprise</h3>
          
          {/* Sélecteur d'année */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <label className="text-sm font-medium text-gray-700">
              Année à afficher:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Résumé global</option>
              {toutes_annees.map((annee) => (
                <option key={annee.annee} value={annee.annee}>
                  Année {annee.annee}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedYear === 'all' ? (
          // Vue résumé global condensée
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Années</p>
              <p className="text-lg font-bold text-blue-600">{resume_global.nombre_annees}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total bénéfices</p>
              <p className="text-sm font-bold text-green-600 truncate">{formatAmount(resume_global.total_benefices_toutes_annees)}</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Moyenne/an</p>
              <p className="text-sm font-bold text-yellow-600 truncate">{formatAmount(resume_global.moyenne_benefice_par_annee)}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Période</p>
              <p className="text-sm font-bold text-purple-600">
                {resume_global.premiere_annee} - {resume_global.derniere_annee}
              </p>
            </div>
          </div>
        ) : (
          // Vue spécifique à une année condensée
          entreprise_info && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Année</p>
                <p className="font-semibold text-blue-600">{entreprise_info.annee}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Bénéfice</p>
                <p className="font-semibold text-green-600 truncate">{formatAmount(entreprise_info.benefice)}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Rapport</p>
                {entreprise_info.rapport ? (
                  <button
                    onClick={() => handleDownloadRapport(entreprise_info.rapport, entreprise_info.annee)}
                    disabled={isPending}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Télécharger
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">Aucun</span>
                )}
              </div>
            </div>
          )
        )}
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
              Tous ({statistiques.nombre_total_actionnaires})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                filter === 'active' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Actifs ({statistiques.actionnaires_actifs})
            </button>
            <button
              onClick={() => setFilter('blocked')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                filter === 'blocked' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bloqués ({statistiques.actionnaires_bloques})
            </button>
          </div>

          {/* Indicateur de filtrage actif */}
          {filter !== 'all' && (
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>
                Affichage de {filteredActionnaires.length} 
                {filter === 'active' ? ' actionnaire(s) actif(s)' : ' actionnaire(s) bloqué(s)'}
              </span>
              <button
                onClick={() => setFilter('all')}
                className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir tous
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ← MODIFICATION de la liste des actionnaires avec sélection et suppression */}
      <ActionnairesList
        actionnaires={filteredActionnaires}
        onEditUser={handleEditUser}
        onToggleStatus={handleToggleStatus}
        onDeleteUser={handleDeleteUser}  // ← Nouvelle prop
        isPending={isPending}
        formatAmount={formatAmount}
        formatActions={formatActions}
        formatDate={formatDate}
        currentFilter={filter}
        isSelectionMode={isSelectionMode}  // ← Nouvelle prop
        selectedUsers={selectedUsers}  // ← Nouvelle prop
        onToggleUserSelection={toggleUserSelection}  // ← Nouvelle prop
      />

      {/* Modal d'édition */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Modifier l'actionnaire
                </h2>
                <button 
                  onClick={closeEditModal}
                  disabled={isPending}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prénom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="firstName"
                        value={editForm.firstName}
                        onChange={handleEditInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          editErrors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {editErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{editErrors.firstName}</p>
                    )}
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="lastName"
                        value={editForm.lastName}
                        onChange={handleEditInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          editErrors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {editErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{editErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        name="telephone"
                        value={editForm.telephone}
                        onChange={handleEditInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          editErrors.telephone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {editErrors.telephone && (
                      <p className="text-red-500 text-xs mt-1">{editErrors.telephone}</p>
                    )}
                  </div>

                  {/* Dividende */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dividende
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        name="dividende"
                        value={editForm.dividende}
                        onChange={handleEditInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          editErrors.dividende ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {editErrors.dividende && (
                      <p className="text-red-500 text-xs mt-1">{editErrors.dividende}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
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
                        value={editForm.nbre_actions}
                        onChange={handleEditInputChange}
                        min="0"
                        step="0.1"
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          editErrors.nbre_actions ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {editErrors.nbre_actions && (
                      <p className="text-red-500 text-xs mt-1">{editErrors.nbre_actions}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Les dividendes seront recalculés automatiquement si vous modifiez le nombre d'actions
                    </p>
                  </div>
                </div>

                {/* Statut bloqué */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut du compte
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isBlocked"
                      checked={editForm.isBlocked}
                      onChange={handleEditInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Compte bloqué
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Un compte bloqué ne peut pas se connecter
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={closeEditModal}
                  disabled={isPending}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={isPending}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création d'actionnaire */}
      <CreateActionnaireModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setMessage({ type: 'success', text: 'Actionnaire créé avec succès !' });
          router.refresh();
        }}
        isPending={isPending}
        onCreateActionnaire={handleCreateActionnaire}
      />

      {/* Modal d'ajout nouvelle année */}
      <AddNewYearModal
        isOpen={showNewYearModal}
        onClose={() => setShowNewYearModal(false)}
        onSuccess={() => {
          setMessage({ type: 'success', text: 'Nouvelle année ajoutée avec succès ! Dividendes recalculés.' });
          router.refresh();
        }}
        isPending={isPending}
        onAddNewYear={handleAddNewYear}
      />

      {/* Résumé en bas */}
      <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {filter === 'all' ? 'Résumé Global' : 
                 filter === 'active' ? 'Résumé Actionnaires Actifs' : 
                 'Résumé Actionnaires Bloqués'}
              </h3>
              {filter !== 'all' && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  filter === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {filteredActionnaires.length} élément(s)
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm sm:text-base">
                  {filter === 'all' ? 'Total Actions:' : 'Actions filtrées:'}
                </span>
                <span className="font-semibold text-sm sm:text-base">
                  {filter === 'all' 
                    ? formatActions(statistiques.total_actions)
                    : formatActions(filteredActionnaires.reduce((sum, a) => sum + a.nbre_actions, 0))
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm sm:text-base">
                  {filter === 'all' ? 'Total Dividendes:' : 'Dividendes filtrés:'}
                </span>
                <span className="font-semibold text-sm sm:text-base">
                  {filter === 'all' 
                    ? formatAmount(statistiques.total_dividendes)
                    : formatAmount(filteredActionnaires.reduce((sum, a) => sum + a.dividende_actuel, 0))
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm sm:text-base">Moyenne par actionnaire:</span>
                <span className="font-semibold text-sm sm:text-base">
                  {filter === 'all' 
                    ? (statistiques.nombre_total_actionnaires > 0 
                        ? formatAmount(statistiques.total_dividendes / statistiques.nombre_total_actionnaires)
                        : formatAmount(0))
                    : (filteredActionnaires.length > 0
                        ? formatAmount(filteredActionnaires.reduce((sum, a) => sum + a.dividende_actuel, 0) / filteredActionnaires.length)
                        : formatAmount(0))
                  }
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions Rapides</h3>
            <div className="space-y-2">
              <button 
                className="w-full flex items-center justify-start px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                onClick={() => {
                  //('Export CSV...', filter, filteredActionnaires);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter {filter !== 'all' ? 'la sélection' : 'tout'} en CSV
              </button>
              <button 
                className="w-full flex items-center justify-start px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                onClick={() => {
                  //('Générer rapport...', filter, filteredActionnaires);
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Générer rapport PDF
              </button>
              {/* ← NOUVEAU bouton d'action rapide pour la suppression */}
              {selectedUsers.length > 0 && (
                <button 
                  className="w-full flex items-center justify-start px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  onClick={handleDeleteMultipleUsers}
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer la sélection ({selectedUsers.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionnairesAdminView;