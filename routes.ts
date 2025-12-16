// routes.ts
export const LOGIN_REDIRECT_URL = "/auth/signin";

// Routes publiques
export const PublicRoute: (string | RegExp)[] = [
  "",
  "/",
  "/auth/register",
  "/auth/login",
  "/auth/forget-password",
  "/auth/new-password",
  "/auth/forgot-password",
  "/media-organizer",
  "/services",
  "/dashboard/Clients",
  "/clients",
  /^\/entreprise\/[^\/]+$/,
  /^\/services\/[^\/]+$/,
  "/page",
  /^\/dashboard\/[^\/]+$/,
];

// URLs de redirection pour chaque rôle
export const ROLE_REDIRECT_URLS: { [key: string]: string } = {
  admin: "dashboard/admin/actionnaire",  // Ajout du rôle admin
  actionnaire: "dashboard/actionnaire",
};

// Définir les chemins accessibles pour chaque rôle
export const ROLEPAGES = {
  admin: [  // Ajout des routes pour admin
    "/dashboard/entreprise",
    "/page",
    "/dashboard/admin/actionnaire",
    "/dashboard/admin/sellaction",
    "/dashboard/entreprise",
    "/dashboard/admin/actionssellbuyuser",
  "/dashboard/admin/priceSettings",
    "/dashboard/admin/prevision",
       "/dashboard/admin/historique",
        "/dashboard/admin/purchaseActionnaire",
     /^\/dashboard\/profile\/[^/]+(\/orders\/)[^/]$/,
        /^\/dashboard\/profile\/[^/]+(\/updateProfile)?$/  ,
        /^\/dashboard\/profile\/[^/]+(\/changePassWord)?$/ ,
        /^\/explorer\/[^/]+\/confirm\/[^/]+$/,
  ],
  actionnaire: [
    "/dashboard/actionnaire", 
    "/dashboard/dividente",
    "/dashboard/mypurchase",
     "/dashboard/rapport",
     "/dashboard/prevision",
     "/dashboard/purchaseActionnaire",
    "/dashboard/profile",
     /^\/dashboard\/profile\/[^/]+(\/orders\/)[^/]$/,
        /^\/dashboard\/profile\/[^/]+(\/updateProfile)?$/  ,
        /^\/dashboard\/profile\/[^/]+(\/changePassWord)?$/ ,
        /^\/explorer\/[^/]+\/confirm\/[^/]+$/,
  ]
};

// Fonction pour obtenir l'URL en fonction du rôle
export function getRedirectUrlForRole(role: string): string | null {
  const url = ROLE_REDIRECT_URLS[role];
  return url ? `/${url}` : null;
}