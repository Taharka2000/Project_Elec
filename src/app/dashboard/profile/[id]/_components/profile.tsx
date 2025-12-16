'use client'

import { User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useActionState } from "react"; // ✅ Changé ici
import { useFormStatus } from "react-dom";

import { toast } from "sonner";
import { updateProfile } from "@/actions/selldividente";

type Props = {
  user: User;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Mise à jour..." : "Mettre à jour le profil"}
    </Button>
  );
}

export default function Profile({ user }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction] = useActionState(updateProfile, null); // ✅ Changé ici

  // Afficher les notifications avec useEffect pour éviter les warnings
  useEffect(() => {
    if (state?.type === "success") {
      toast.success(state.message);
      setIsEditing(false);
      // Optionnel: rafraîchir la page
       window.location.reload();
    } else if (state?.type === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="w-full mx-auto px-4 overflow-hidden">
      <h1 className="text-xl md:text-3xl font-bold text-indigo-900 mb-6 text-center">
        Profil utilisateur
      </h1>
      <div className="bg-white rounded-lg w-[70vw] flex flex-col justify-center items-center py-4">
        <div className="flex w-full flex-col md:flex-row gap-8 p-4">
          {/* Section Information du Compte */}
          <div className="flex-1 bg-slate-50 p-6 rounded-lg shadow-lg">
            <div className="text-center mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-orange-500">Information du Compte</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Annuler" : "Modifier"}
              </Button>
            </div>

            {!isEditing ? (
              // Mode Lecture
              <div className="space-y-3 text-lg">
                <div>Nom: <span className="font-semibold">{`${user?.firstName} ${user?.lastName}`}</span></div>
                <div>Email: <span className="font-semibold">{user?.email || "Non défini"}</span></div>
                <div>Téléphone: <span className="font-semibold">{user?.telephone}</span></div>
                <div>Adresse: <span className="font-semibold">{user?.adresse || "Non définie"}</span></div>
                <div>Nationalité: <span className="font-semibold">{user?.nationalite || "Non définie"}</span></div>
                <div>Ville: <span className="font-semibold">{user?.ville || "Non définie"}</span></div>
                <div>Pays: <span className="font-semibold">{user?.pays || "Non défini"}</span></div>
                <div>Carte D'identite National: <span className="font-semibold">{user?.cni}</span></div>
                <div>Date de naissance: <span className="font-semibold">{user?.dateNaissance || "Non définie"}</span></div>
                <div>Role: <Badge variant="secondary"><span className="font-semibold">{user?.role}</span></Badge></div>
                <div>
                  Permissions:
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user?.permissions?.map((permission, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  Statut:
                  <Badge variant={user?.status === 'active' ? 'default' : 'destructive'} className="ml-2">
                    {user?.status}
                  </Badge>
                </div>
                <div>
                  Compte bloqué:
                  <Badge variant={user?.isBlocked ? 'destructive' : 'default'} className="ml-2">
                    {user?.isBlocked ? 'Oui' : 'Non'}
                  </Badge>
                </div>
                <div>
                  Date de création:
                  <span className="font-semibold">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Non définie'}
                  </span>
                </div>
              </div>
            ) : (
              // Mode Édition
              <form action={formAction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={user?.firstName}
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={user?.lastName}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={user?.email}
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      defaultValue={user?.telephone}
                      placeholder="771234567"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input
                      id="adresse"
                      name="adresse"
                      defaultValue={user?.adresse}
                      placeholder="Votre adresse complète"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationalite">Nationalité</Label>
                    <Input
                      id="nationalite"
                      name="nationalite"
                      defaultValue={user?.nationalite}
                      placeholder="Votre nationalité"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ville">Ville</Label>
                    <Input
                      id="ville"
                      name="ville"
                      defaultValue={user?.ville}
                      placeholder="Votre ville"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pays">Pays</Label>
                    <Input
                      id="pays"
                      name="pays"
                      defaultValue={user?.pays}
                      placeholder="Votre pays"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateNaissance">Date de naissance</Label>
                    <Input
                      id="dateNaissance"
                      name="dateNaissance"
                      type="date"
                      defaultValue={user?.dateNaissance}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateNaissance">Numero Carte D'identite National</Label>
                    <Input
                      id="cni"
                      name="cni"
                      type="cni"
                      defaultValue={user?.cni}
                    />
                  </div>
                </div>
                <SubmitButton />
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}