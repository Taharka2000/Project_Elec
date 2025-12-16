"use client";
import React, { useState, useTransition } from 'react';
import { 
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Phone,
  ChevronDown
} from 'lucide-react';
import { initiateDividendWithdrawalAdmin } from '@/actions/dividendActions';

interface DividendWithdrawalModalProps {
  userPhone?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

const DividendWithdrawalModal: React.FC<DividendWithdrawalModalProps> = ({ 
  userPhone = '',
  isOpen = false,
  onClose,
  onSuccess
}) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(userPhone);
  const [paymentMethod, setPaymentMethod] = useState('wave-senegal');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any>(null);
  const [phoneError, setPhoneError] = useState('');
  const [amountError, setAmountError] = useState('');

  React.useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  React.useEffect(() => {
    if (userPhone) {
      setPhoneNumber(userPhone);
    }
  }, [userPhone]);

  const paymentMethods = [
    { value: 'wave-senegal', label: '🌊 Wave (Sénégal)' },
    { value: 'orange-money-senegal', label: '🟠 Orange Money (Sénégal)' },
    { value: 'free-money-senegal', label: '🆓 Free Money (Sénégal)' },
    { value: 'expresso-senegal', label: '📱 Expresso (Sénégal)' },
    { value: 'mtn-benin', label: '📞 MTN (Bénin)' },
    { value: 'moov-benin', label: '📱 Moov (Bénin)' },
    { value: 'mtn-ci', label: '📞 MTN (Côte d\'Ivoire)' },
    { value: 'orange-money-ci', label: '🟠 Orange Money (Côte d\'Ivoire)' },
    { value: 'moov-ci', label: '📱 Moov (Côte d\'Ivoire)' },
    { value: 'wave-ci', label: '🌊 Wave (Côte d\'Ivoire)' },
    { value: 't-money-togo', label: '💚 T-Money (Togo)' },
    { value: 'moov-togo', label: '📱 Moov (Togo)' },
    { value: 'orange-money-mali', label: '🟠 Orange Money (Mali)' },
    { value: 'orange-money-burkina', label: '🟠 Orange Money (Burkina Faso)' },
    { value: 'moov-burkina-faso', label: '📱 Moov (Burkina Faso)' }
  ];

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 7 && cleaned.length <= 15;
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setPhoneError('');
    if (value && !validatePhone(value)) {
      setPhoneError('Le numéro doit contenir entre 7 et 15 chiffres');
    }
  };

  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    setAmount(cleanValue);
    setAmountError('');
  };

  const openModal = () => {
    setIsModalOpen(true);
    setAmount('');
    setPhoneNumber(userPhone);
    setPaymentMethod('wave-senegal');
    setResult(null);
    setPhoneError('');
    setAmountError('');
  };

  const closeModal = () => {
    if (onClose) {
      onClose();
    } else {
      setIsModalOpen(false);
    }
    setResult(null);
  };

  const handleWithdrawal = () => {
    if (!validatePhone(phoneNumber)) {
      setPhoneError('Numéro de téléphone invalide');
      return;
    }

    if (!amount || parseFloat(amount) < 200) {
      setAmountError('Le montant minimum est de 200 FCFA');
      return;
    }

    startTransition(async () => {
      try {
        const response = await initiateDividendWithdrawalAdmin({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          amount: parseFloat(amount),
          paymentMethod
        });

        setResult(response);

        if (response.type === 'success') {
          setTimeout(() => {
            if (onSuccess) {
              onSuccess();
            }
            closeModal();
          }, 3000);
        }
      } catch (error) {
        setResult({
          type: 'error',
          message: 'Erreur lors du retrait'
        });
      }
    });
  };

  const WithdrawalButton = () => (
    !isOpen ? (
      <button
        onClick={openModal}
        className="bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Retirer mes dividendes
      </button>
    ) : null
  );

  if (result?.type === 'success') {
    return (
      <>
        <WithdrawalButton />
        {(isModalOpen || isOpen) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Retrait effectué avec succès !
                </h2>
                <p className="text-gray-600 mb-6">
                  {result.message}
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant:</span>
                      <span className="font-bold text-green-600">
                        {formatAmount(parseFloat(amount))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Téléphone:</span>
                      <span className="font-medium">{phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Méthode:</span>
                      <span className="font-medium">
                        {paymentMethods.find(m => m.value === paymentMethod)?.label}
                      </span>
                    </div>
                    {result.data?.disburse_invoice && (
                      <div className="flex justify-between text-xs mt-3 pt-3 border-t">
                        <span className="text-gray-600">Référence:</span>
                        <span className="font-mono text-blue-600">
                          {result.data.disburse_invoice}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-300"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <WithdrawalButton />
      {(isModalOpen || isOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Wallet className="w-6 h-6 mr-2 text-green-600" />
                Retirer mes Dividendes
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant à retirer (FCFA)
                  </label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className={`w-full p-3 border ${amountError ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg`}
                    placeholder="Montant"
                    disabled={isPending}
                  />
                  {amountError ? (
                    <p className="text-xs text-red-500 mt-1">{amountError}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Minimum: 100 FCFA</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`w-full p-3 pl-10 border ${phoneError ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="Ex: 221700000000"
                      disabled={isPending}
                    />
                  </div>
                  {phoneError ? (
                    <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Format: 7-15 chiffres (sans espaces ni +)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Méthode de paiement
                  </label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none pr-10"
                      disabled={isPending}
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {result && result.type !== 'success' && (
                  <div className={`${
                    result.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                  } border rounded-lg p-4 flex items-start`}>
                    <AlertCircle className={`w-5 h-5 ${
                      result.type === 'error' ? 'text-red-500' : 'text-blue-500'
                    } mr-2 mt-0.5 flex-shrink-0`} />
                    <div className="flex-1">
                      <span className={result.type === 'error' ? 'text-red-700' : 'text-blue-700'}>
                        {result.message}
                      </span>
                      {result.errors && (
                        <div className="mt-2 text-sm">
                          {Object.entries(result.errors).map(([field, messages]) => (
                            <p key={field} className="text-red-600">
                              • {Array.isArray(messages) ? messages.join(', ') : messages}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {amount && phoneNumber && validatePhone(phoneNumber) && parseFloat(amount) >= 100 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Résumé du retrait</h3>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div className="flex justify-between">
                        <span>Montant:</span>
                        <span className="font-bold">{formatAmount(parseFloat(amount))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Téléphone:</span>
                        <span className="font-medium">{phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Méthode:</span>
                        <span className="font-medium">
                          {paymentMethods.find(m => m.value === paymentMethod)?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleWithdrawal}
                    disabled={
                      !validatePhone(phoneNumber) || 
                      !amount ||
                      parseFloat(amount) < 100 ||
                      isPending
                    }
                    className="flex-1 bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Effectuer le retrait
                      </>
                    )}
                  </button>
                  <button
                    onClick={closeModal}
                    disabled={isPending}
                    className="px-6 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-300"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DividendWithdrawalModal;