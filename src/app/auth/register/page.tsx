import React from 'react';

import logoright from "../../../../public/img/49d8b26e015a7e225b4d9e7d54de9596ff91defa.jpg";
import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RegisterForm from './_components/register-form';

// Interface pour le payload du JWT
interface JWTPayload {
  data: {
    id: string;
    role: 'admin' | 'actionnaire';
  };
  iat: number;
  exp: number;
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('Erreur de décodage JWT:', error);
    return null;
  }
}

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (token) {
    // Décoder le token JWT pour obtenir les informations utilisateur
    const decoded = decodeJWT(token.value);
    
    if (decoded && decoded.data && decoded.data.role) {
      // Redirection basée sur le rôle
      if (decoded.data.role === 'admin') {
        redirect("/dashboard/admin/actionnaire");
      } else if (decoded.data.role === 'actionnaire') {
        redirect("/dashboard/actionnaire");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row">
        <RegisterForm />
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            src={logoright}
            alt="Image d'authentification"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0"
          />
        </div>
      </div>
    </div>
  );
}