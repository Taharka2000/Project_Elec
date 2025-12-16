// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// import { LoginFormView } from "./login-form-view";
// import { OtpFormView } from "./otp-form-view";
// import { login } from "@/actions/login";
// import { verifyOtp } from "@/actions/verifyOtp";

// const LoginForm = () => {
//   const router = useRouter();
//   const [state, setState] = useState({
//     requiresOtp: false,
//     telephone: "",
//     message: "",
//     type: "",
//     errors: {},
//     userId: "",
//   });

//   const [otpState, setOtpState] = useState({
//     type: "",
//     message: "",
//     url: "",
//   });

//   const [telephone, setTelephone] = useState("");
//   const [password, setPassword] = useState("");
//   const [otp, setOtp] = useState("");

//   const handleLogin = async (formData: FormData) => {
   

//     try {
//       const result = await login(null, formData);
     
      
//       setState(prevState => {
//         const newState = {
//           requiresOtp: result.requiresOtp || false,
//           telephone: result.telephone || telephone,
//           message: result.message || "",
//           type: result.type || "",
//           errors: result.errors || {},
//           userId: result.userId || "",
//         };
//         return newState;
//       });
//     } catch (error) {
   
//       setState({
//         requiresOtp: false,
//         telephone: "",
//         message: "Une erreur s'est produite",
//         type: "error",
//         errors: {},
//         userId: "",
//       });
//     }
//   };

//   const handleVerifyOtp = async (formData: FormData) => {
//     try {
//       const result = await verifyOtp(null, formData);
    

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

//   useEffect(() => {
//   }, [state]);

//   useEffect(() => {
//     if (otpState.type === "redirect" && otpState.url) {
//       router.push(otpState.url);
//     }
//   }, [otpState, router]);

//   return (
//     <div className="w-full md:w-1/2 p-8">
//       {!state.requiresOtp ? (
//         <LoginFormView
//           telephone={telephone}
//           setTelephone={setTelephone}
//           password={password}
//           setPassword={setPassword}
//           state={state}
//           handleLogin={handleLogin}
//         />
//       ) : (
//         <OtpFormView
//           otp={otp}
//           setOtp={setOtp}
//           telephone={telephone}
//           userId={state.userId}
//           otpState={otpState}
//           handleVerifyOtp={handleVerifyOtp}
//         />
//       )}
//     </div>
//   );
// };

// export default LoginForm;


"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginFormView } from "./login-form-view";
import { login } from "@/actions/login";

const LoginForm = () => {
  const router = useRouter();
  const [state, setState] = useState({
    message: "",
    type: "",
    errors: {},
  });

  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (formData: FormData) => {
    try {
      const result = await login(null, formData);
      
      setState({
        message: result.message || "",
        type: result.type || "",
        errors: result.errors || {},
      });

      // Si la connexion réussit, rediriger l'utilisateur
      if (result.type === "redirect" && result.url) {
        router.push(result.url);
      }
    } catch (error) {
      setState({
        message: "Une erreur s'est produite",
        type: "error",
        errors: {},
      });
    }
  };

  // Effet pour gérer la redirection
  useEffect(() => {
    if (state.type === "redirect" && state.message) {
      // La redirection sera gérée par le router.push ci-dessus
    }
  }, [state]);

  return (
    <div className="w-full md:w-1/2 p-8">
      <LoginFormView
        telephone={telephone}
        setTelephone={setTelephone}
        password={password}
        setPassword={setPassword}
        state={state}
        handleLogin={handleLogin}
      />
    </div>
  );
};

export default LoginForm;