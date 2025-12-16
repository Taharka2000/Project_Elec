"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import { cookies } from "next/headers";

export async function fetchJSON(url: string) {
  const token = (await cookies()).get("token")?.value;

  try {
    // Construire les headers de manière conditionnelle pour éviter l'erreur TypeScript
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    // Ajouter Authorization seulement si le token existe
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${url}`, {
      headers,
    });

    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch (error) {
    console.error("Erreur dans fetchJSON:", error);
    return [];
  }
}

export async function createdOrUpdated({
    url,
    data,
    updated = false
}: { 
    url: string;
    data: any;
    updated?: boolean;
}) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        console.error("🚨 Token manquant !");
        throw new Error("Token manquant");
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    let res;
    try {
        if (!updated) {
            res = await axios.post(url, data, { headers });
        } else {
            res = await axios.put(url, data, { headers });
        }

        return res.data;
    } catch (error: any) {
        console.error("💥 Erreur API :", error.response?.data || error.message);
        throw error;
    }
}
export async function deleteWithAxios({
    url,
    data = null
}: { 
    url: string;
    data?: any;
}) {
    const token = (await cookies()).get("token")?.value;

    // 🔍 DEBUG: Vérification du token
    //console.log("🔐 Token récupéré pour suppression:", token ? "✅ Présent" : "❌ Manquant");
    //console.log("🌐 URL de suppression:", url);
    //console.log("📦 Data de suppression:", data);

    if (!token) {
        console.error("🚨 Token manquant pour la suppression !");
        throw new Error("Token manquant - Veuillez vous reconnecter");
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

  /*   console.log("📋 Headers pour suppression:", {
        ...headers,
        Authorization: headers.Authorization.substring(0, 20) + "..." // Masquer le token complet
    }); */

    try {
        let res;
        if (data) {
            // Pour les suppressions avec body (suppression multiple)
            //console.log("🔄 Suppression multiple avec data");
            res = await axios.delete(url, { headers, data });
        } else {
            // Pour les suppressions simples avec URL params
            //("🔄 Suppression simple sans data");
            res = await axios.delete(url, { headers });
        }

        //console.log("✅ Suppression réussie:", res.status, res.statusText);
        return res.data;
    } catch (error: any) {
        console.error("💥 Erreur API Delete détaillée:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            url: url
        });
        throw error;
    }
}