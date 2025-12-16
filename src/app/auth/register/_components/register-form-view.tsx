import { AlertFeedback } from "@/components/alert-feedback";
import CustomInputError from "@/components/custom-input-error";
import SubmitButton from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import logoDioko from "../../../../../public/img/NewDiokoDeseign.png";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface RegisterFormViewProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  telephone: string;
  setTelephone: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  state: any;
  handleRegister: (formData: FormData) => Promise<void>;
}

export const RegisterFormView = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  telephone,
  setTelephone,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  state,
  handleRegister,
}: RegisterFormViewProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <div className="py-8 flex items-center justify-center">
        <div className="w-36">
          <Link href="/">
            <Image
              src={logoDioko}
              alt="Image d'authentification"
              className="object-contain"
            />
          </Link>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Créer un compte</h2>
        <p className="text-gray-600">Inscrivez-vous sur Dioko</p>
      </div>
      <form action={handleRegister} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            {state?.errors?.firstName && (
              <CustomInputError>{state.errors.firstName}</CustomInputError>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            {state?.errors?.lastName && (
              <CustomInputError>{state.errors.lastName}</CustomInputError>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone (Renseigner l'indicatif de votre pays)</Label>
          <Input
            id="telephone"
            name="telephone"
            placeholder="+22100000000000"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />
          {state?.errors?.telephone && (
            <CustomInputError>{state.errors.telephone}</CustomInputError>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {state?.errors?.password && (
            <CustomInputError>{state.errors.password}</CustomInputError>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {state?.errors?.confirmPassword && (
            <CustomInputError>{state.errors.confirmPassword}</CustomInputError>
          )}
        </div>
        
        {state?.message && (
          <AlertFeedback type={state?.type} message={state?.message} />
        )}
        
        <SubmitButton title="S'inscrire" />
        
        <div className="text-center text-sm text-gray-600">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Se connecter
          </Link>
        </div>
      </form>
    </>
  );
};