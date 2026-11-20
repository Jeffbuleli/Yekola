"use client";

import { PiLoginButton } from "@/components/pi-login-button";

/** Connexion Sandbox / Pi Browser : Pioneer uniquement (SDK Pi). */
export function PiAuthPanel({ onSuccess }: { onSuccess: (role: string) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--yk-muted)]">
        Pi Network exige une connexion avec votre compte <strong>Pioneer</strong> via le SDK Pi.
        Aucun email ni mot de passe Yekola dans le Sandbox.
      </p>
      <PiLoginButton onSuccess={onSuccess} />
      <p className="text-xs text-[var(--yk-muted)]">
        Un profil apprenant est créé à partir de votre @username Pi. Achats cours et paiements Test
        Pi ensuite.
      </p>
    </div>
  );
}