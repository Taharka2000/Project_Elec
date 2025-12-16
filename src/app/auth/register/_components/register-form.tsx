// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { RegisterFormView } from "./register-form-view";
// import { initiateRegister, resendRegisterOtp, verifyRegisterOtp } from "@/actions/Register";
// import { RegisterOtpFormView } from "./ register-otp-form-view";


// const RegisterForm = () => {
//   const router = useRouter();
//   const [state, setState] = useState({
//     requiresOtp: false,
//     telephone: "",
//     message: "",
//     type: "",
//     errors: {},
//     tempUserId: "",
//   });

//   const [otpState, setOtpState] = useState({
//     type: "",
//     message: "",
//     url: "",
//   });

//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [telephone, setTelephone] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [otp, setOtp] = useState("");

// const handleRegister = async (formData: FormData) => {
//     try {
//       /* console.log("🚀 [Client] Début handleRegister");
//       console.log("📋 [Client] FormData entries:", {
//         firstName: formData.get("firstName"),
//         lastName: formData.get("lastName"),
//         telephone: formData.get("telephone"),
//         password: formData.get("password") ? "***" : null,
//         confirmPassword: formData.get("confirmPassword") ? "***" : null,
//       });
//  */
//       const result = await initiateRegister(null, formData);
      
//       //console.log("✅ [Client] Résultat reçu:", result); fattt
      
//       setState(prevState => ({
//         requiresOtp: result.requiresOtp || false,
//         telephone: result.telephone || telephone,
//         message: result.message || "",
//         type: result.type || "",
//         errors: result.errors || {},
//         tempUserId: result.tempUserId || "",
//       }));
//     } catch (error) {
//       console.error("💥 [Client] Erreur catch:", error);
//       setState({
//         requiresOtp: false,
//         telephone: "",
//         message: "Une erreur s'est produite",
//         type: "error",
//         errors: {},
//         tempUserId: "",
//       });
//     }
// };

//   const handleVerifyOtp = async (formData: FormData) => {
//     try {
//       const result = await verifyRegisterOtp(null, formData);

//       setOtpState({
//         type: result.type || "",
//         message: result.message || "",
//         url: result.url || ""
//       });

//       if (result.type === "redirect" && result.url) {
//         router.push(result.url);
//       }
//     } catch (error) {
//       setOtpState({
//         type: "error",
//         message: "Erreur lors de la vérification",
//         url: ""
//       });
//     }
//   };

//   const handleResendOtp = async () => {
//     try {
//       const formData = new FormData();
//       formData.append('tempUserId', state.tempUserId);
      
//       const result = await resendRegisterOtp(null, formData);
      
//       setOtpState({
//         type: result.type || "",
//         message: result.message || "",
//         url: ""
//       });
//     } catch (error) {
//       setOtpState({
//         type: "error",
//         message: "Erreur lors du renvoi",
//         url: ""
//       });
//     }
//   };

//   useEffect(() => {
//     if (otpState.type === "redirect" && otpState.url) {
//       router.push(otpState.url);
//     }
//   }, [otpState, router]);

//   return (
//     <div className="w-full md:w-1/2 p-8">
//       {!state.requiresOtp ? (
//         <RegisterFormView
//           firstName={firstName}
//           setFirstName={setFirstName}
//           lastName={lastName}
//           setLastName={setLastName}
//           telephone={telephone}
//           setTelephone={setTelephone}
//           password={password}
//           setPassword={setPassword}
//           confirmPassword={confirmPassword}
//           setConfirmPassword={setConfirmPassword}
//           state={state}
//           handleRegister={handleRegister}
//         />
//       ) : (
//         <RegisterOtpFormView
//           otp={otp}
//           setOtp={setOtp}
//           telephone={state.telephone}
//           tempUserId={state.tempUserId}
//           otpState={otpState}
//           handleVerifyOtp={handleVerifyOtp}
//           handleResendOtp={handleResendOtp}
//         />
//       )}
//     </div>
//   );
// };

// export default RegisterForm;


"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegisterFormView } from "./register-form-view";
import { initiateRegister } from "@/actions/Register";

const RegisterForm = () => {
  const router = useRouter();
  const [state, setState] = useState({
    message: "",
    type: "",
    errors: {},
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (formData: FormData) => {
    try {
      const result = await initiateRegister(null, formData);
      
      setState({
        message: result.message || "",
        type: result.type || "",
        errors: result.errors || {},
      });

      // Si succès, rediriger vers le dashboard ou la page de connexion
      if (result.type === "success") {
        
        
        // Option 2: Rediriger vers la page de connexion
        setTimeout(() => {
         router.push("/auth/login");
         }, 1500);
      }
    } catch (error) {
      console.error("💥 [Client] Erreur catch:", error);
      setState({
        message: "Une erreur s'est produite",
        type: "error",
        errors: {},
      });
    }
  };

  return (
    <div className="w-full md:w-1/2 p-8">
      <RegisterFormView
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        telephone={telephone}
        setTelephone={setTelephone}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        state={state}
        handleRegister={handleRegister}
      />
    </div>
  );
};

export default RegisterForm;