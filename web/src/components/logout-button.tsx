"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="yk-btn yk-btn-ghost !py-2 !text-xs"
      onClick={async () => {
        await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "logout" }),
        });
        router.push("/");
        router.refresh();
      }}
    >
      Déconnexion
    </button>
  );
}
