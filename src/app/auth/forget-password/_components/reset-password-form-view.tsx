// reset-password-form-view.tsx
import { AlertFeedback } from "@/components/alert-feedback";
import CustomInputError from "@/components/custom-input-error";
import SubmitButton from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logoDioko from "../../../../../public/img/NewDiokoDeseign.png";

interface ResetPasswordFormViewProps {
  telephone: string;
  setTelephone: (value: string) => void;
  state: any;
  handleRequestReset: (formData: FormData) => Promise<void>;
}

export const ResetPasswordFormView = ({
  telephone,
  setTelephone,
  state,
  handleRequestReset,
}: ResetPasswordFormViewProps) => {
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
        <h2 className="text-2xl font-bold mb-2">Réinitialiser le mot de passe</h2>
        <p className="text-gray-600">
          Entrez votre numéro de téléphone pour recevoir un code de réinitialisation sur WhatsApp
        </p>
      </div>

      <form action={handleRequestReset} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="telephone">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Numéro de téléphone
            </div>
          </Label>
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            placeholder="77 123 45 67"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="pl-10"
          />
          {state?.errors?.telephone && (
            <CustomInputError>{state.errors.telephone}</CustomInputError>
          )}
        </div>

        {state?.message && (
          <AlertFeedback type={state?.type} message={state?.message} />
        )}

        <SubmitButton title="Envoyer le code" />
      </form>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-center">
          <Link 
            href="/auth/login" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Information</h3>
          <p className="text-blue-700 text-sm">
            Vous recevrez un code de vérification à 6 chiffres sur votre numéro WhatsApp. 
            Ce code expire dans 10 minutes.
          </p>
        </div>
      </div>
    </>
  );
};