// utils/projectionUtils.ts - Fonctions utilitaires pour les projections

/**
 * Calculer les statistiques des projections
 */
export const calculateProjectionStats = (projections: any[]) => {
  if (!Array.isArray(projections) || projections.length === 0) {
    return {
      total_projections: 0,
      latest_year: null,
      total_revenue_projected: 0,
      total_profit_projected: 0,
      average_dividend_per_share: 0
    };
  }

  const totalProjections = projections.length;
  
  // Année la plus récente
  const years = projections.map(p => new Date(p.date).getFullYear());
  const latestYear = Math.max(...years);
  
  // Totaux
  const totalRevenue = projections.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const totalProfit = projections.reduce((sum, p) => sum + ((p.revenue || 0) - (p.expenses || 0)), 0);
  
  // Dividende moyen par action
  const totalDividends = projections.reduce((sum, p) => {
    const profit = (p.revenue || 0) - (p.expenses || 0);
    const dividend = (p.shares && p.shares > 0) ? profit / p.shares : 0;
    return sum + dividend;
  }, 0);
  
  const averageDividend = totalProjections > 0 ? totalDividends / totalProjections : 0;

  return {
    total_projections: totalProjections,
    latest_year: latestYear,
    total_revenue_projected: totalRevenue,
    total_profit_projected: totalProfit,
    average_dividend_per_share: averageDividend
  };
};

/**
 * Formater les montants pour l'affichage
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

/**
 * Formater les nombres
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('fr-FR').format(number || 0);
};

/**
 * Formater les dates
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Date invalide';
  }
};

/**
 * Calculer le profit d'une projection
 */
export const calculateProfit = (projection: any): number => {
  return (projection?.revenue || 0) - (projection?.expenses || 0);
};

/**
 * Calculer le dividende par action
 */
export const calculateDividendPerShare = (projection: any): number => {
  const profit = calculateProfit(projection);
  return (projection?.shares && projection.shares > 0) ? profit / projection.shares : 0;
};

/**
 * Préparer les données CSV pour export
 */
export const prepareCsvData = (projections: any[]) => {
  if (!Array.isArray(projections) || projections.length === 0) {
    return {
      headers: [],
      rows: [],
      content: ''
    };
  }

  const headers = [
    'Date',
    'Année',
    'Utilisateurs',
    'Revenus (XOF)',
    'Dépenses (XOF)',
    'Profit (XOF)',
    'Actions',
    'Dividende par Action (XOF)',
    'Créé le',
    'ID'
  ];

  const rows = projections.map(projection => {
    const profit = calculateProfit(projection);
    const dividend = calculateDividendPerShare(projection);
    
    return [
      formatDate(projection.date),
      new Date(projection.date).getFullYear(),
      projection.users || 0,
      projection.revenue || 0,
      projection.expenses || 0,
      profit,
      projection.shares || 0,
      dividend,
      formatDate(projection.createdAt),
      projection._id || ''
    ];
  });

  const content = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return {
    headers,
    rows,
    content,
    filename: `projections_${new Date().toISOString().split('T')[0]}.csv`
  };
};

/**
 * Télécharger un fichier CSV côté client
 */
export const downloadCsvFile = (content: string, filename: string) => {
  if (typeof window === 'undefined') return;
  
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Filtrer les projections par période
 */
export const filterProjectionsByPeriod = (
  projections: any[], 
  filter: 'all' | 'recent' | 'old'
) => {
  if (!Array.isArray(projections)) {
    return [];
  }

  if (filter === 'all') {
    return projections;
  }

  const currentYear = new Date().getFullYear();
  
  return projections.filter(projection => {
    if (!projection?.date) {
      return filter === 'all';
    }

    try {
      const projectionYear = new Date(projection.date).getFullYear();
      
      if (filter === 'recent') return projectionYear >= currentYear - 1;
      if (filter === 'old') return projectionYear < currentYear - 1;
      return true;
    } catch (error) {
      console.warn('Invalid date in projection:', projection.date, error);
      return filter === 'all';
    }
  });
};

/**
 * Valider les données d'une projection
 */
export const validateProjectionData = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.users || data.users <= 0) {
    errors.users = 'Le nombre d\'utilisateurs doit être supérieur à 0';
  }

  if (!data.revenue || data.revenue <= 0) {
    errors.revenue = 'Le chiffre d\'affaires doit être supérieur à 0';
  }

  if (data.expenses < 0) {
    errors.expenses = 'Les dépenses ne peuvent pas être négatives';
  }

  if (data.expenses >= data.revenue && data.revenue > 0) {
    errors.expenses = 'Les dépenses doivent être inférieures au chiffre d\'affaires';
  }

  if (!data.shares || data.shares <= 0) {
    errors.shares = 'Le nombre d\'actions doit être supérieur à 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};