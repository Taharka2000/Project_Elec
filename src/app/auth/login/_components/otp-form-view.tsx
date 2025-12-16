import { AlertFeedback } from "@/components/alert-feedback";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import logoDioko from "../../../../../public/img/NewDiokoDeseign.png";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRef } from "react";

interface OtpFormViewProps {
  otp: string;
  setOtp: (value: string) => void;
  telephone: string;
  userId: string;
  otpState: any;
  handleVerifyOtp: (formData: FormData) => Promise<void>;
}

export const OtpFormView = ({
  otp,
  setOtp,
  telephone,
  userId,
  otpState,
  handleVerifyOtp,
}: OtpFormViewProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('otp', otp);
      handleVerifyOtp(formData);
    }
  };

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
        <h2 className="text-2xl font-bold mb-2">Vérifier le code OTP</h2>
        <p className="text-gray-600">
          Entrez le code OTP envoyé à votre numéro de téléphone : {telephone}
        </p>
      </div>
      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="otp">Code OTP (6 chiffres)</Label>
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
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="otp" value={otp} />
        </div>
        {otpState?.message && (
          <AlertFeedback type={otpState?.type} message={otpState?.message} />
        )}
        <Button 
          type="submit" 
          className="w-full"
          disabled={otp.length !== 6}
        >
          Vérifier le code
        </Button>
        <div className="text-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-blue-500 text-sm hover:underline"
          >
            Renvoyer le code
          </button>
        </div>
      </form>
    </>
  );
};

export default OtpFormView;