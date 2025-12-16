'use client'

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserInfos } from "@/lib/type";
import { changePassword } from "@/actions/Register";
 // Import de la nouvelle fonction

type Props = {
  user: UserInfos;
};

export default function ChangePassword({ user }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Validation côté client
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Tous les champs sont requis.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("userId", user._id);
      formDataToSend.append("password", currentPassword);
      formDataToSend.append("newPassword", newPassword);

      const response = await changePassword({}, formDataToSend);

      if (response?.type === "error") {
        setError(response.message);
        toast.error("Erreur lors de la mise à jour !");
        return;
      }

      setSuccess("Mot de passe changé avec succès !");
      toast.success("Mise à jour réussie !");
      
      // Réinitialiser les champs
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push(`/dashboard/profile/${user._id}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Une erreur inattendue s'est produite.");
      toast.error("Erreur lors de la mise à jour !");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:p-6 overflow-hidden">
      <h1 className="text-3xl font-bold text-indigo-900 mb-6 text-center">
        Changer de mot de passe
      </h1>
      <Card className="max-w-5xl w-full mx-auto p-4 md:p-8">
        <CardHeader></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={error ? "border-red-500" : ""}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={error ? "border-red-500" : ""}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={error ? "border-red-500" : ""}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}
            {success && <p className="text-green-500 text-center">{success}</p>}

            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="w-full md:w-1/2"
                disabled={isLoading}
              >
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}