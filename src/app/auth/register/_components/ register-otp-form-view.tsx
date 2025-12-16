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
import { useRef, useState, useEffect } from "react";

interface RegisterOtpFormViewProps {
  otp: string;
  setOtp: (value: string) => void;
  telephone: string;
  tempUserId: string;
  otpState: any;
  handleVerifyOtp: (formData: FormData) => Promise<void>;
  handleResendOtp: () => Promise<void>;
}

export const RegisterOtpFormView = ({
  otp,
  setOtp,
  telephone,
  tempUserId,
  otpState,
  handleVerifyOtp,
  handleResendOtp,
}: RegisterOtpFormViewProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      const formData = new FormData();
      formData.append('tempUserId', tempUserId);
      formData.append('otpCode', otp);
      handleVerifyOtp(formData);
    }
  };

  const handleResend = async () => {
    await handleResendOtp();
    setCountdown(300); // Reset countdown
    setCanResend(false);
    setOtp(""); // Clear OTP input
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
        <h2 className="text-2xl font-bold mb-2">Vérification WhatsApp</h2>
        <p className="text-gray-600">
          Un code de vérification a été envoyé via WhatsApp au numéro : {telephone}
        </p>
      </div>
      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="otp">Code de vérification (6 chiffres)</Label>
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
          <input type="hidden" name="tempUserId" value={tempUserId} />
          <input type="hidden" name="otpCode" value={otp} />
        </div>

        <div className="text-center text-sm text-gray-600">
          {countdown > 0 ? (
            <span>Code expire dans: <span className="font-medium text-red-600">{formatTime(countdown)}</span></span>
          ) : (
            <span className="text-red-600 font-medium">Code expiré</span>
          )}
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
        
       {/*  <div className="text-center space-y-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className={`text-sm ${canResend ? 'text-blue-500 hover:underline' : 'text-gray-400 cursor-not-allowed'}`}
          >
            {canResend ? 'Renvoyer le code' : `Renvoyer disponible dans ${formatTime(countdown)}`}
          </button>
          <div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-gray-500 text-sm hover:underline"
            >
              Retour à l'inscription
            </button>
          </div>
        </div> */}
      </form>
    </>
  );
};
