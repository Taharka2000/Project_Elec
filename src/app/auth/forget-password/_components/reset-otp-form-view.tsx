// reset-otp-form-view.tsx
import { AlertFeedback } from "@/components/alert-feedback";
import CustomInputError from "@/components/custom-input-error";
import SubmitButton from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Clock, Eye, EyeOff, RefreshCw, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logoDioko from "../../../../.././public/img/49d8b26e015a7e225b4d9e7d54de9596ff91defa.jpg";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRef, useState } from "react";

interface ResetOtpFormViewProps {
  otp: string;
  setOtp: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  telephone: string;
  userId: string;
  expiresIn: string;
  otpState: any;
  handleVerifyOtp: (formData: FormData) => Promise<void>;
  handleResendOtp: () => Promise<void>;
  handleBackToPhone: () => void;
  isResending: boolean;
}

export const ResetOtpFormView = ({
  otp,
  setOtp,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  telephone,
  userId,
  expiresIn,
  otpState,
  handleVerifyOtp,
  handleResendOtp,
  handleBackToPhone,
  isResending,
}: ResetOtpFormViewProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6 && newPassword && confirmPassword) {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('otpCode', otp);
      formData.append('newPassword', newPassword);
      formData.append('confirmPassword', confirmPassword);
      handleVerifyOtp(formData);
    }
  };

  const isFormValid = otp.length === 6 && newPassword.length >= 6 && confirmPassword.length >= 6;

  return (
    <>
      <div className="py-8 flex items-center justify-center">
        <div className="w-36">
          <Link href="/">
            <Image
              src={logoDioko}
              alt="Logo Dioko"
              className="object-contain"
            />
          </Link>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Créer un nouveau mot de passe</h2>
        <p className="text-gray-600">
          Entrez le code reçu sur WhatsApp ({telephone}) et choisissez votre nouveau mot de passe
        </p>
      </div>

      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
        {/* Code OTP */}
        <div className="space-y-2">
          <Label htmlFor="otp">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Code de vérification (6 chiffres)
            </div>
          </Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {otpState?.errors?.otpCode && (
            <CustomInputError>{otpState.errors.otpCode}</CustomInputError>
          )}
        </div>

        {/* Nouveau mot de passe */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nouveau mot de passe</Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 caractères"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {otpState?.errors?.newPassword && (
            <CustomInputError>{otpState.errors.newPassword}</CustomInputError>
          )}
        </div>

        {/* Confirmer mot de passe */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Retapez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {otpState?.errors?.confirmPassword && (
            <CustomInputError>{otpState.errors.confirmPassword}</CustomInputError>
          )}
        </div>

        {/* Champs cachés */}
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="otpCode" value={otp} />

        {/* Message d'état */}
        {otpState?.message && (
          <AlertFeedback type={otpState?.type} message={otpState?.message} />
        )}

        {/* Indicateur d'expiration */}
        {expiresIn && (
          <div className="flex items-center gap-2 text-orange-600 text-sm bg-orange-50 p-3 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>Code valide pendant {expiresIn}</span>
          </div>
        )}

        {/* Bouton de soumission */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={!isFormValid}
        >
          Réinitialiser le mot de passe
        </Button>

        {/* Actions secondaires */}
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? "Envoi en cours..." : "Renvoyer le code"}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleBackToPhone}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Changer de numéro
            </button>
          </div>
        </div>

        {/* Conseils de sécurité */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">Conseils pour un mot de passe sécurisé</h3>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• Au moins 6 caractères</li>
            <li>• Mélangez lettres, chiffres et symboles</li>
            <li>• Évitez les informations personnelles</li>
            <li>• Utilisez un mot de passe unique pour ce compte</li>
          </ul>
        </div>
      </form>
    </>
  );
};