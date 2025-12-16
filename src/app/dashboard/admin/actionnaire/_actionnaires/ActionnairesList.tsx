import React, { useState, useMemo } from 'react';
import { 
  Share, 
  DollarSign,
  UserCheck, 
  UserX,
  AlertCircle,
  CheckCircle,
  Edit3,
  Mail,
  Phone,
  Trash2,
  Search,
  Filter,
  X,
  SortAsc,
  SortDesc
} from 'lucide-react';
import Pagination from './Pagination';

// Types
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

interface ActionnaireListProps {
  actionnaires: Actionnaire[];
  onEditUser: (actionnaire: Actionnaire) => void;
  onToggleStatus: (actionnaireId: string, currentBlocked: boolean) => void;
  onDeleteUser: (userId: string, userName: string) => void;
  isPending: boolean;
  formatAmount: (amount: number) => string;
  formatActions: (actions: number) => string;
  formatDate: (dateString: string) => string;
  currentFilter?: 'all' | 'active' | 'blocked';
  isSelectionMode?: boolean;
  selectedUsers?: string[];
  onToggleUserSelection?: (userId: string) => void;
}

type SortField = 'name' | 'email' | 'actions' | 'dividende' | 'status' | 'date';
type SortDirection = 'asc' | 'desc';

const ActionnairesList: React.FC<ActionnaireListProps> = ({
  actionnaires,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
  isPending,
  formatAmount,
  formatActions,
  formatDate,
  currentFilter = 'all',
  isSelectionMode = false,
  selectedUsers = [],
  onToggleUserSelection
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const safeString = (value: any): string => {
    return value ? String(value) : '';
  };

  const filteredAndSortedActionnaires = useMemo(() => {
    let filtered = [...actionnaires];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(actionnaire => {
        const firstName = safeString(actionnaire.firstName).toLowerCase();
        const lastName = safeString(actionnaire.lastName).toLowerCase();
        const telephone = safeString(actionnaire.telephone);
        const email = safeString(actionnaire.email).toLowerCase();
        const id = safeString(actionnaire.id).toLowerCase();
        
        return firstName.includes(search) ||
               lastName.includes(search) ||
               telephone.includes(search) ||
               email.includes(search) ||
               id.includes(search);
      });
    }

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          const aFullName = `${safeString(a.firstName)} ${safeString(a.lastName)}`.toLowerCase();
          const bFullName = `${safeString(b.firstName)} ${safeString(b.lastName)}`.toLowerCase();
          aValue = aFullName;
          bValue = bFullName;
          break;
        case 'email':
          aValue = safeString(a.email).toLowerCase();
          bValue = safeString(b.email).toLowerCase();
          break;
        case 'actions':
          aValue = Number(a.nbre_actions) || 0;
          bValue = Number(b.nbre_actions) || 0;
          break;
        case 'dividende':
          aValue = Number(a.dividende_actuel) || 0;
          bValue = Number(b.dividende_actuel) || 0;
          break;
        case 'status':
          aValue = a.isBlocked ? 1 : 0;
          bValue = b.isBlocked ? 1 : 0;
          break;
        case 'date':
          aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          break;
        default:
          aValue = safeString(a.firstName).toLowerCase();
          bValue = safeString(b.firstName).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [actionnaires, searchTerm, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedActionnaires.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActionnaires = filteredAndSortedActionnaires.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [actionnaires.length, searchTerm]);

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleUserSelection = (userId: string) => {
    if (onToggleUserSelection) {
      onToggleUserSelection(userId);
    }
  };

  const handleDeleteClick = (actionnaire: Actionnaire) => {
    const userName = `${safeString(actionnaire.firstName)} ${safeString(actionnaire.lastName)}`.trim() || 'Utilisateur inconnu';
    onDeleteUser(actionnaire.id, userName);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />;
  };

  const highlightSearchTerm = (text: string, searchTerm: string): string => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  if (filteredAndSortedActionnaires.length === 0 && searchTerm) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-3">Trier par:</span>
                {[
                  { field: 'name' as SortField, label: 'Nom' },
                  { field: 'email' as SortField, label: 'Email' },
                  { field: 'actions' as SortField, label: 'Actions' },
                  { field: 'dividende' as SortField, label: 'Dividende' },
                  { field: 'status' as SortField, label: 'Statut' },
                  { field: 'date' as SortField, label: 'Date' }
                ].map(({ field, label }) => (
                  <button
                    key={field}
                    onClick={() => handleSort(field)}
                    className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                      sortField === field
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                    {getSortIcon(field)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">Aucun résultat trouvé</p>
              <p className="text-sm text-gray-500">
                Aucun actionnaire ne correspond à votre recherche "{searchTerm}"
              </p>
              <button
                onClick={clearSearch}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Effacer la recherche
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (actionnaires.length === 0) {
    const getEmptyStateMessage = () => {
      switch (currentFilter) {
        case 'active':
          return {
            title: "Aucun actionnaire actif",
            subtitle: "Tous les actionnaires sont actuellement bloqués",
            icon: UserCheck,
            iconColor: "text-green-400"
          };
        case 'blocked':
          return {
            title: "Aucun actionnaire bloqué", 
            subtitle: "Tous les actionnaires sont actuellement actifs",
            icon: UserX,
            iconColor: "text-red-400"
          };
        default:
          return {
            title: "Aucun actionnaire trouvé",
            subtitle: "Aucun actionnaire ne correspond aux critères sélectionnés",
            icon: UserX,
            iconColor: "text-gray-400"
          };
      }
    };

    const emptyState = getEmptyStateMessage();
    const IconComponent = emptyState.icon;

    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <IconComponent className={`w-8 h-8 ${emptyState.iconColor}`} />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">{emptyState.title}</p>
            <p className="text-sm text-gray-500">{emptyState.subtitle}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, téléphone ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 mr-3">Trier par:</span>
              {[
                { field: 'name' as SortField, label: 'Nom' },
                { field: 'email' as SortField, label: 'Email' },
                { field: 'actions' as SortField, label: 'Actions' },
                { field: 'dividende' as SortField, label: 'Dividende' },
                { field: 'status' as SortField, label: 'Statut' },
                { field: 'date' as SortField, label: 'Date' }
              ].map(({ field, label }) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                    sortField === field
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                  {getSortIcon(field)}
                </button>
              ))}
            </div>
          </div>
        )}

        {(searchTerm || sortField !== 'name' || sortDirection !== 'asc') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Filtres actifs:</span>
              
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Recherche: "{searchTerm}"
                  <button
                    onClick={clearSearch}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {(sortField !== 'name' || sortDirection !== 'asc') && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                  Tri: {
                    sortField === 'name' ? 'Nom' :
                    sortField === 'email' ? 'Email' :
                    sortField === 'actions' ? 'Actions' :
                    sortField === 'dividende' ? 'Dividende' :
                    sortField === 'status' ? 'Statut' : 'Date'
                  } ({sortDirection === 'asc' ? 'croissant' : 'décroissant'})
                  <button
                    onClick={() => {
                      setSortField('name');
                      setSortDirection('asc');
                    }}
                    className="ml-1 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {searchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center text-sm text-blue-800">
            <Search className="w-4 h-4 mr-2" />
            <span>
              {filteredAndSortedActionnaires.length} résultat(s) trouvé(s) sur {actionnaires.length} actionnaire(s)
            </span>
          </div>
        </div>
      )}

      {/* Tableau Desktop */}
      <div className="bg-white rounded-lg shadow hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                {isSelectionMode && (
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-800 w-12">
                    Sélection
                  </th>
                )}
                
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center hover:text-blue-600 transition-colors"
                  >
                    Actionnaire
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center hover:text-blue-600 transition-colors"
                  >
                    Contact
                    {getSortIcon('email')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
                  <button
                    onClick={() => handleSort('actions')}
                    className="flex items-center hover:text-blue-600 transition-colors"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Actions
                    {getSortIcon('actions')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
                  <button
                    onClick={() => handleSort('dividende')}
                    className="flex items-center hover:text-blue-600 transition-colors"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Dividende
                    {getSortIcon('dividende')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center hover:text-blue-600 transition-colors"
                  >
                    Statut
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center hover:text-blue-600 transition-colors"
                  >
                    Dernière MAJ
                    {getSortIcon('date')}
                  </button>
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-800">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentActionnaires.map((actionnaire) => {
                const fullName = `${safeString(actionnaire.firstName)} ${safeString(actionnaire.lastName)}`.trim();
                const displayName = fullName || 'Nom non défini';
                
                return (
                  <tr key={actionnaire.id} className="hover:bg-gray-50">
                    {isSelectionMode && (
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(actionnaire.id)}
                          onChange={() => handleUserSelection(actionnaire.id)}
                          disabled={isPending}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {searchTerm ? (
                            <span dangerouslySetInnerHTML={{
                              __html: highlightSearchTerm(displayName, searchTerm)
                            }} />
                          ) : (
                            displayName
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {safeString(actionnaire.id).slice(-8) || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-500">
                          {searchTerm ? (
                            <span dangerouslySetInnerHTML={{
                              __html: highlightSearchTerm(safeString(actionnaire.telephone), searchTerm)
                            }} />
                          ) : (
                            safeString(actionnaire.telephone) || 'N/A'
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatActions(actionnaire.nbre_actions || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(actionnaire.dividende_actuel || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        actionnaire.isBlocked
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {actionnaire.isBlocked ? (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Bloqué
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Actif
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {actionnaire.updatedAt ? formatDate(actionnaire.updatedAt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onEditUser(actionnaire)}
                          disabled={isPending}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Modifier
                        </button>
                        <button
                          onClick={() => onToggleStatus(actionnaire.id, actionnaire.isBlocked)}
                          disabled={isPending}
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                            actionnaire.isBlocked
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {actionnaire.isBlocked ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Débloquer
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Bloquer
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(actionnaire)}
                          disabled={isPending}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Supprimer cet utilisateur"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Supprimer
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

      {/* Vue Mobile/Tablette */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {currentActionnaires.map((actionnaire) => {
          const fullName = `${safeString(actionnaire.firstName)} ${safeString(actionnaire.lastName)}`.trim();
          const displayName = fullName || 'Nom non défini';
          
          return (
            <div key={actionnaire.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  {isSelectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(actionnaire.id)}
                      onChange={() => handleUserSelection(actionnaire.id)}
                      disabled={isPending}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 mt-1"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {searchTerm ? (
                        <span dangerouslySetInnerHTML={{
                          __html: highlightSearchTerm(displayName, searchTerm)
                        }} />
                      ) : (
                        displayName
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ID: {safeString(actionnaire.id).slice(-8) || 'N/A'}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                  actionnaire.isBlocked
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {actionnaire.isBlocked ? (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Bloqué
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Actif
                    </>
                  )}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>
                    {searchTerm ? (
                      <span dangerouslySetInnerHTML={{
                        __html: highlightSearchTerm(safeString(actionnaire.telephone), searchTerm)
                      }} />
                    ) : (
                      safeString(actionnaire.telephone) || 'N/A'
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Share className="w-4 h-4 mr-2" />
                    Actions
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    {formatActions(actionnaire.nbre_actions || 0)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Dividende
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    {formatAmount(actionnaire.dividende_actuel || 0)}
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                Dernière mise à jour: {actionnaire.updatedAt ? formatDate(actionnaire.updatedAt) : 'N/A'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => onEditUser(actionnaire)}
                  disabled={isPending}
                  className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modifier
                </button>
                <button
                  onClick={() => onToggleStatus(actionnaire.id, actionnaire.isBlocked)}
                  disabled={isPending}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors text-sm ${
                    actionnaire.isBlocked
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {actionnaire.isBlocked ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Débloquer
                    </>
                  ) : (
                    <>
                      <UserX className="w-4 h-4 mr-2" />
                      Bloquer
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteClick(actionnaire)}
                  disabled={isPending}
                  className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <div className="text-sm text-gray-600">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredAndSortedActionnaires.length)} sur {filteredAndSortedActionnaires.length} résultat(s)
              {searchTerm && ` (filtré sur ${actionnaires.length} total)`}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Éléments par page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  console.log('Changement items par page:', e.target.value);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredAndSortedActionnaires.length}
          />
        </div>
      )}

      {/* Résumé des résultats de filtrage */}
      {(searchTerm || sortField !== 'name' || sortDirection !== 'asc') && (
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Résumé du filtrage</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total affiché:</span>
              <span className="font-medium ml-1">{filteredAndSortedActionnaires.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Actions totales:</span>
              <span className="font-medium ml-1">
                {formatActions(filteredAndSortedActionnaires.reduce((sum, a) => sum + (a.nbre_actions || 0), 0))}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Dividendes totaux:</span>
              <span className="font-medium ml-1">
                {formatAmount(filteredAndSortedActionnaires.reduce((sum, a) => sum + (a.dividende_actuel || 0), 0))}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Actifs/Bloqués:</span>
              <span className="font-medium ml-1">
                {filteredAndSortedActionnaires.filter(a => !a.isBlocked).length}/
                {filteredAndSortedActionnaires.filter(a => a.isBlocked).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionnairesList;