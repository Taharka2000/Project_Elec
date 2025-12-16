export type RequestData = {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    telephone: string;
    nomEntreprise: string;
    ninea: string;
    dateCreation: string;
    rccm: string;
    representéPar: string;
  };
  //tete
export interface User {
  _id: string;
  id: string;
  cni:string;
  firstName: string;
  lastName: string;
  telephone: string;
  email?: string;
  password: string;
  role: string;
  permissions?: string[];
  status?: string;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  imgUser?: string;
  
  // Nouveaux champs pour le profil
  adresse?: string;
  nationalite?: string;
  ville?: string;
  pays?: string;
  dateNaissance?: string;
  
  // Champs pour les actionnaires
  nbre_actions?: number;
  dividende?: number;
}
  export type FormDataRegister = {
    nom: string;           // Correspond à lastName
    prenom: string;        // Correspond à firstName
    email: string;         // Reste identique
    password: string;      // Reste identique
    telephone: string;     // Correspond à phone
    nomEntreprise: string; // Correspond à companyName
    ninea: string;         // Nouveau champ spécifique
    dateCreation: string;  // Nouveau champ spécifique
    rccm: string;         // Nouveau champ spécifique     // Nouveau champ spécifique
    representéPar: string; // Nouveau champ spécifique
};