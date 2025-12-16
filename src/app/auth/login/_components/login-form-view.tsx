import { AlertFeedback } from "@/components/alert-feedback";
import CustomInputError from "@/components/custom-input-error";
import SubmitButton from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import logoDioko from "../../../../../public/img/NewDiokoDeseign.png";

interface LoginFormViewProps {
  telephone: string;
  setTelephone: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  state: any;
  handleLogin: (formData: FormData) => Promise<void>;
}

export const LoginFormView = ({
  telephone,
  setTelephone,
  password,
  setPassword,
  state,
  handleLogin,
}: LoginFormViewProps) => {
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
        <h2 className="text-2xl font-bold mb-2">Welcome to Dioko</h2>
        <p className="text-gray-600">Connectez-vous</p>
      </div>
      <form action={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            name="telephone"
            placeholder="Numéro de téléphone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />
          {state?.errors?.telephone && (
            <CustomInputError>{state.errors.telephone}</CustomInputError>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {state?.errors?.password && (
            <CustomInputError>{state.errors.password}</CustomInputError>
          )}
        </div>
        {state?.message && (
          <AlertFeedback type={state?.type} message={state?.message} />
        )}
        <SubmitButton title="Se connecter" />
        <div className="flex justify-around">
        <div className="text-center text-sm text-gray-600">

          <Link href="/auth/register" className="text-blue-600 hover:underline">
          Creer un compte
          </Link>
        </div>
         <div className="text-blue-800 text-right text-sm cursor-pointer">
          <Link href={"/auth/forget-password"}>Mot de passe oublié ?</Link>
        </div>
        </div>
      </form>
      
    </>
  );
};