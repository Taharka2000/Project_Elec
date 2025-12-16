"use client";
import React, { useState } from 'react';
import {
  Calendar,
  TrendingUp,
  AlertCircle,
  Download
} from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { downloadRapportFile } from '@/actions/actionnaire';

// Types
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
  statistiques: Statistiques;
  entreprise_info: EntrepriseInfo | null;
  toutes_annees: AnneeInfo[];
  resume_global: ResumeGlobal;
}

const ActionnairesAdminView: React.FC<ActionnairesAdminViewProps> = ({
  statistiques,
  entreprise_info,
  toutes_annees,
  resume_global
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lecture de l'année depuis l'URL
  const selectedYear = searchParams.get('annee') ? Number(searchParams.get('annee')) : 'all';

  // Fonction pour formater les montants
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fonction pour gérer le changement d'année
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Informations Entreprise</h1>
            <p className="text-gray-600 mt-1">Consultation des bénéfices et données de l'entreprise</p>
          </div>
        </div>
      </div>



      {/* Informations entreprise */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Informations Entreprise</h3>

          {/* Sélecteur d'année */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">
              Année à afficher:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          // Vue résumé global de toutes les années
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Nombre d'années</p>
                <p className="text-2xl font-bold text-blue-600">{resume_global.nombre_annees}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total des bénéfices</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(resume_global.total_benefices_toutes_annees)}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Moyenne par année</p>
                <p className="text-2xl font-bold text-yellow-600">{formatAmount(resume_global.moyenne_benefice_par_annee)}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Période</p>
                <p className="text-lg font-bold text-purple-600">
                  {resume_global.premiere_annee} - {resume_global.derniere_annee}
                </p>
              </div>
            </div>

            {/* Liste détaillée des années */}
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Détail par année</h4>
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Année</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Bénéfice</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">% du total</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Rapport</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Date d'ajout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {toutes_annees.map((annee) => (
                      <tr key={annee.annee} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-semibold text-blue-600">
                          {annee.annee}
                        </td>
                        <td className="px-4 py-2 font-medium">
                          {formatAmount(annee.benefice)}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {resume_global.total_benefices_toutes_annees > 0
                            ? ((annee.benefice / resume_global.total_benefices_toutes_annees) * 100).toFixed(1)
                            : 0
                          }%
                        </td>
                        <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                          {annee.rapport}
                        </td>
                        <td className="px-4 py-2 text-gray-500">
                          {formatDate(annee.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // Vue spécifique à une année
          entreprise_info && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Année sélectionnée</p>
                <p className="font-semibold text-lg text-blue-600">{entreprise_info.annee}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bénéfice de l'année</p>
                <p className="font-semibold text-lg text-green-600">{formatAmount(entreprise_info.benefice)}</p>
              </div>
              {entreprise_info.rapport && (
                <button
                  onClick={async () => {
                    postMessage({ type: 'success', text: `Téléchargement du rapport ${entreprise_info.annee} en cours...` });

                    const result = await downloadRapportFile(entreprise_info.rapport);

                    postMessage({
                      type: result.type,
                      text: result.message || `Téléchargement du rapport ${entreprise_info.annee} terminé`
                    });
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </button>
              )}

            </div>
          )
        )}
      </div>

      {/* Alerte mode d'affichage */}
      {selectedYear !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Mode filtrage par année activé
              </p>
              <p className="text-xs text-blue-600">
                Les informations affichées correspondent uniquement à l'année {selectedYear}.
                Pour voir le résumé global de toutes les années, sélectionnez "Résumé global".
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionnairesAdminView;