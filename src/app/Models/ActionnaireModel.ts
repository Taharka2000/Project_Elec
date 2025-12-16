export interface ActionsData {
  nbre_actions: number;
  dividende_actuel: number;
  derniere_mise_a_jour: string;
}



export interface ActionnaireUserViewProps {
  actions: ActionsData;
  user_info: UserInfo;
}

 export interface ActionsData {
  nbre_actions: number;
  dividende_actuel: number;
  derniere_mise_a_jour: string;
}

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
    telephonePartenaire?: string | null;
}



export interface WithdrawalForm {
  phoneNumber: string;
  amount: string;
  paymentMethod: string;
}