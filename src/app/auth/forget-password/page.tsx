// app/auth/forget-password/page.tsx
import React from 'react';
import ResetPasswordForm from './_components/reset-password-form';
import logoright from "../../../../public/img/49d8b26e015a7e225b4d9e7d54de9596ff91defa.jpg";
import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

export default async function ForgetPasswordPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  // Si l'utilisateur est déjà connecté, le rediriger vers son dashboard
  if (token) {
    const decoded = decodeJWT(token.value);
    
    if (decoded && decoded.data && decoded.data.role) {
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
        <ResetPasswordForm />
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            src={logoright}
            alt="Image de réinitialisation"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0"
          />
          {/* Overlay avec message motivant */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-8">
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Récupération sécurisée</h2>
              <p className="text-lg mb-6">
                Votre sécurité est notre priorité. Suivez les étapes simples pour récupérer l'accès à votre compte.
              </p>
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span>Entrez votre numéro de téléphone</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span>Recevez le code sur WhatsApp</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <span>Créez votre nouveau mot de passe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}