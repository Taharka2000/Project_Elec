"use client";
import React, { useState } from 'react';
import { 
  X, 
  Bitcoin, 
  Copy, 
  CheckCircle
} from 'lucide-react';

interface CryptoPurchaseModalProps {
  currentActions?: number;
  userInfo?: {
    firstName: string;
    lastName: string;
    telephone: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const CryptoPurchaseModal: React.FC<CryptoPurchaseModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const USDT_ADDRESS = "TJXiUBpSbATMXYJdjcuJjABmGBUDhqRbMN";
  const WHATSAPP_NUMBER = "+221773878232";

  // Copier l'adresse
  const copyAddress = () => {
    navigator.clipboard.writeText(USDT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Bitcoin className="w-5 h-5 mr-2 text-purple-600" />
            Paiement Crypto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="space-y-4">
            <p className="text-lg font-semibold text-gray-900">
              1 action = 4,5 USDT
            </p>
            
            <p className="text-gray-700">
              Copiez l'adresse suivante et transférez vos USDT sur le réseau TRC20
            </p>

            {/* Adresse USDT avec bouton copier */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Adresse USDT (TRC20)
              </label>
              <div className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg">
                <h1 className="flex-1 text-sm font-mono break-all text-gray-800">
                  {USDT_ADDRESS}
                </h1>
                <button
                  onClick={copyAddress}
                  className="px-4 py-2 rounded-lg transition-all flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copié!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copier
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-gray-700">
              Et faites une capture de la transaction que vous envoyez sur WhatsApp
            </p>

            {/* Numéro WhatsApp */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold text-center text-lg">
                WhatsApp: {WHATSAPP_NUMBER}
              </p>
            </div>
          </div>

          {/* Boutons d'actionjhjhjhj */}
          
        </div>
      </div>
    </div>
  );
};

export default CryptoPurchaseModal;