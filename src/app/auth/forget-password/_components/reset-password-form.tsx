"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ResetPasswordFormView } from "./reset-password-form-view";
import { ResetOtpFormView } from "./reset-otp-form-view";
import { requestPasswordReset, verifyResetOTP, resendResetOTP } from "@/actions/reset-password";

const ResetPasswordForm = () => {
  const router = useRouter();
  const [state, setState] = useState({
    requiresOtp: false,
    telephone: "",
    message: "",
    type: "",
    errors: {},
    userId: "",
    expiresIn: "",
  });

  const [otpState, setOtpState] = useState({
    type: "",
    message: "",
    url: "",
    errors: {},
  });

  const [telephone, setTelephone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResending, setIsResending] = useState(false);

  // Gestion de la demande de réinitialisation
  const handleRequestReset = async (formData: FormData) => {
    try {
      const result = await requestPasswordReset(null, formData);
      
      setState(prevState => ({
        ...prevState,
        requiresOtp: result.requiresOtp || false,
        telephone: result.telephone || telephone,
        message: result.message || "",
        type: result.type || "",
        errors: result.errors || {},
        userId: result.userId || "",
        expiresIn: result.expiresIn || "",
      }));
    } catch (error) {
      console.error("Reset request error:", error);
      setState(prevState => ({
        ...prevState,
        requiresOtp: false,
        message: "Une erreur s'est produite",
        type: "error",
        errors: {},
      }));
    }
  };

  // Gestion de la vérification OTP et réinitialisation
  const handleVerifyOtp = async (formData: FormData) => {
    try {
      const result = await verifyResetOTP(null, formData);

      setOtpState({
        type: result.type || "",
        message: result.message || "",
        url: result.url || "",
        errors: result.errors || {},
      });

      if (result.type === "redirect" && result.url) {
        // Petit délai pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          router.push(result.url);
        }, 1500);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpState({
        type: "error",
        message: "Erreur lors de la vérification",
        url: "",
        errors: {},
      });
    }
  };

  // Gestion du renvoi d'OTP
  const handleResendOtp = async () => {
    if (!state.userId || isResending) return;
    
    setIsResending(true);
    try {
      const result = await resendResetOTP(state.userId);
      
      setOtpState(prevState => ({
        ...prevState,
        type: result.type,
        message: result.message,
      }));
    } catch (error) {
      console.error("Resend OTP error:", error);
      setOtpState(prevState => ({
        ...prevState,
        type: "error",
        message: "Erreur lors du renvoi du code",
      }));
    } finally {
      setIsResending(false);
    }
  };

  // Retour à l'étape précédente
  const handleBackToPhone = () => {
    setState(prevState => ({
      ...prevState,
      requiresOtp: false,
      message: "",
      type: "",
      errors: {},
      userId: "",
    }));
    setOtpState({
      type: "",
      message: "",
      url: "",
      errors: {},
    });
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  useEffect(() => {
   
  }, [state]);

  useEffect(() => {
   
  }, [otpState]);

  return (
    <div className="w-full md:w-1/2 p-8">
      {!state.requiresOtp ? (
        <ResetPasswordFormView
          telephone={telephone}
          setTelephone={setTelephone}
          state={state}
          handleRequestReset={handleRequestReset}
        />
      ) : (
        <ResetOtpFormView
          otp={otp}
          setOtp={setOtp}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          telephone={telephone}
          userId={state.userId}
          expiresIn={state.expiresIn}
          otpState={otpState}
          handleVerifyOtp={handleVerifyOtp}
          handleResendOtp={handleResendOtp}
          handleBackToPhone={handleBackToPhone}
          isResending={isResending}
        />
      )}
    </div>
  );
};

export default ResetPasswordForm;