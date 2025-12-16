export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  telephone: string;
  role: string;
  isBlocked: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  // ✅ NOUVEAU CHAMP AJOUTÉ
  telephonePartenaire?: string | null;
}

export interface ActionsData {
  nbre_actions: number;
  dividende_actuel: number;
}

export interface ActionnaireResponse {
  actions: ActionsData;
  user_info: UserInfo;
}