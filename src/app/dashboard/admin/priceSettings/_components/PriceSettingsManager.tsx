"use client";
import React, { useState, useTransition } from 'react';
import { 
  DollarSign,
  Users,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Star,
  Phone,
  AlertCircle,
  CheckCircle,
  Settings,
  RefreshCw
} from 'lucide-react';
import { 
  upsertPrice, 
  deletePrice, 
  addVIPUser, 
  removeVIPUser,
  initializeSystem 
} from '@/actions/priceActions';
import { toast } from 'sonner';

interface Price {
  _id: string;
  type: 'VIP' | 'NORMAL';
  prix_unitaire: number;
  currency: string;
  description?: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VIPUser {
  _id: string;
  telephone: string;
  nom?: string;
  notes?: string;
  actif: boolean;
  date_ajout: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  initialPrices: Price[];
  initialVIPUsers: VIPUser[];
}

const PriceSettingsManager: React.FC<Props> = ({ 
  initialPrices, 
  initialVIPUsers 
}) => {
  const [prices, setPrices] = useState<Price[]>(initialPrices);
  const [vipUsers, setVipUsers] = useState<VIPUser[]>(initialVIPUsers);
  const [isPending, startTransition] = useTransition();

  // États pour l'édition de prix
  const [editingPrice, setEditingPrice] = useState<'VIP' | 'NORMAL' | null>(null);
  const [priceFormData, setPriceFormData] = useState({
    type: 'NORMAL' as 'VIP' | 'NORMAL',
    prix_unitaire: 0,
    description: ''
  });

  // États pour l'ajout de VIP
  const [showAddVIP, setShowAddVIP] = useState(false);
  const [vipFormData, setVipFormData] = useState({
    telephone: '',
    nom: '',
    notes: ''
  });

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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

  // ============================================
  // GESTION DES PRIX
  // ============================================

  const handleEditPrice = (price: Price) => {
    setEditingPrice(price.type);
    setPriceFormData({
      type: price.type,
      prix_unitaire: price.prix_unitaire,
      description: price.description || ''
    });
  };

  const handleSavePrice = () => {
    if (priceFormData.prix_unitaire <= 0) {
      toast.error('Le prix doit être supérieur à 0');
      return;
    }

    startTransition(async () => {
      const result = await upsertPrice(priceFormData);
      
      if (result.type === 'success') {
        toast.success(result.message);
        
        // Mettre à jour la liste
        const updatedPrice = result.data;
        setPrices(prev => {
          const index = prev.findIndex(p => p.type === updatedPrice.type);
          if (index >= 0) {
            const newPrices = [...prev];
            newPrices[index] = updatedPrice;
            return newPrices;
          }
          return [...prev, updatedPrice];
        });
        
        setEditingPrice(null);
        setPriceFormData({ type: 'NORMAL', prix_unitaire: 0, description: '' });
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingPrice(null);
    setPriceFormData({ type: 'NORMAL', prix_unitaire: 0, description: '' });
  };

  // ============================================
  // GESTION DES UTILISATEURS VIP
  // ============================================

  const handleAddVIP = () => {
    if (!vipFormData.telephone.trim()) {
      toast.error('Le numéro de téléphone est requis');
      return;
    }

    startTransition(async () => {
      const result = await addVIPUser(vipFormData);
      
      if (result.type === 'success') {
        toast.success(result.message);
        
        // Ajouter à la liste
        setVipUsers(prev => [...prev, result.data]);
        
        // Réinitialiser le formulaire
        setVipFormData({ telephone: '', nom: '', notes: '' });
        setShowAddVIP(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleRemoveVIP = (telephone: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cet utilisateur VIP ?')) {
      return;
    }

    startTransition(async () => {
      const result = await removeVIPUser({ telephone });
      
      if (result.type === 'success') {
        toast.success(result.message);
        
        // Retirer de la liste
        setVipUsers(prev => prev.filter(vip => vip.telephone !== telephone));
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleInitializeSystem = () => {
    if (!confirm('Êtes-vous sûr de vouloir initialiser le système ? Cela va créer les prix par défaut et migrer les utilisateurs VIP existants.')) {
      return;
    }

    startTransition(async () => {
      const result = await initializeSystem();
      
      if (result.type === 'success') {
        toast.success(result.message);
        
        // Recharger la page pour afficher les nouvelles données
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    });
  };

  const vipPrice = prices.find(p => p.type === 'VIP');
  const normalPrice = prices.find(p => p.type === 'NORMAL');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 flex items-center">
            <Settings className="w-8 h-8 mr-3" />
            Configuration des Prix
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les prix unitaires et les utilisateurs VIP
          </p>
        </div>
       {/*  <button
          onClick={handleInitializeSystem}
          disabled={isPending}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
          Initialiser le système
        </button> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Prix */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-green-600" />
              Prix Unitaires
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Prix VIP */}
            <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <h3 className="font-bold text-gray-900">Prix VIP</h3>
                    <p className="text-sm text-gray-600">Pour les utilisateurs privilégiés</p>
                  </div>
                </div>
                {!editingPrice && vipPrice && (
                  <button
                    onClick={() => handleEditPrice(vipPrice)}
                    disabled={isPending}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              {editingPrice === 'VIP' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix unitaire (XOF)
                    </label>
                    <input
                      type="number"
                      value={priceFormData.prix_unitaire}
                      onChange={(e) => setPriceFormData(prev => ({ ...prev, prix_unitaire: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      step="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optionnel)
                    </label>
                    <input
                      type="text"
                      value={priceFormData.description}
                      onChange={(e) => setPriceFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Description du prix VIP"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSavePrice}
                      disabled={isPending}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isPending}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </button>
                  </div>
                </div>
              ) : vipPrice ? (
                <div>
                  <p className="text-3xl font-bold text-green-600 mb-2">
                    {formatAmount(vipPrice.prix_unitaire)}
                  </p>
                  {vipPrice.description && (
                    <p className="text-sm text-gray-600 mb-2">{vipPrice.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Dernière mise à jour: {formatDate(vipPrice.updatedAt)}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Aucun prix VIP configuré</p>
              )}
            </div>

            {/* Prix Normal */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <h3 className="font-bold text-gray-900">Prix Normal</h3>
                    <p className="text-sm text-gray-600">Pour les utilisateurs standards</p>
                  </div>
                </div>
                {!editingPrice && normalPrice && (
                  <button
                    onClick={() => handleEditPrice(normalPrice)}
                    disabled={isPending}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              {editingPrice === 'NORMAL' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix unitaire (XOF)
                    </label>
                    <input
                      type="number"
                      value={priceFormData.prix_unitaire}
                      onChange={(e) => setPriceFormData(prev => ({ ...prev, prix_unitaire: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      step="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optionnel)
                    </label>
                    <input
                      type="text"
                      value={priceFormData.description}
                      onChange={(e) => setPriceFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Description du prix normal"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSavePrice}
                      disabled={isPending}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isPending}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </button>
                  </div>
                </div>
              ) : normalPrice ? (
                <div>
                  <p className="text-3xl font-bold text-blue-600 mb-2">
                    {formatAmount(normalPrice.prix_unitaire)}
                  </p>
                  {normalPrice.description && (
                    <p className="text-sm text-gray-600 mb-2">{normalPrice.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Dernière mise à jour: {formatDate(normalPrice.updatedAt)}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Aucun prix normal configuré</p>
              )}
            </div>
          </div>
        </div>

        {/* Section Utilisateurs VIP */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-2 text-purple-600" />
              Utilisateurs VIP ({vipUsers.length})
            </h2>
            <button
              onClick={() => setShowAddVIP(!showAddVIP)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter VIP
            </button>
          </div>

          <div className="p-6">
            {/* Formulaire d'ajout */}
            {showAddVIP && (
              <div className="mb-4 p-4 border border-purple-200 rounded-lg bg-purple-50">
                <h3 className="font-bold text-gray-900 mb-3">Ajouter un utilisateur VIP</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de téléphone *
                    </label>
                    <input
                      type="tel"
                      value={vipFormData.telephone}
                      onChange={(e) => setVipFormData(prev => ({ ...prev, telephone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+221XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom (optionnel)
                    </label>
                    <input
                      type="text"
                      value={vipFormData.nom}
                      onChange={(e) => setVipFormData(prev => ({ ...prev, nom: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nom de l'utilisateur VIP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={vipFormData.notes}
                      onChange={(e) => setVipFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Notes sur cet utilisateur VIP"
                      rows={2}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddVIP}
                      disabled={isPending}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </button>
                    <button
                      onClick={() => {
                        setShowAddVIP(false);
                        setVipFormData({ telephone: '', nom: '', notes: '' });
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des utilisateurs VIP */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {vipUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun utilisateur VIP</p>
                </div>
              ) : (
                vipUsers.map((vip) => (
                  <div key={vip._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-gray-900 flex items-center">
                          {vip.nom || 'Utilisateur VIP'}
                          {vip.actif && (
                            <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                          )}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {vip.telephone}
                        </p>
                        {vip.notes && (
                          <p className="text-xs text-gray-500 mt-1">{vip.notes}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Ajouté le {formatDate(vip.date_ajout)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveVIP(vip.telephone)}
                      disabled={isPending}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Retirer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Note d'information */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Information importante :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Les utilisateurs VIP bénéficient d'un prix unitaire réduit pour l'achat d'actions</li>
              <li>Les modifications de prix s'appliquent immédiatement à toutes les futures transactions</li>
              <li>Les utilisateurs VIP sont identifiés par leur numéro de téléphone</li>
              <li>Assurez-vous de bien vérifier les numéros avant de les ajouter à la liste VIP</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSettingsManager;