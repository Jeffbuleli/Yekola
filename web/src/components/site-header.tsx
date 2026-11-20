import { getCurrentUser } from "@/lib/auth/session";
import { SiteHeaderClient } from "@/components/site-header-client";

export async function SiteHeader({
  variant = "public",
}: {
  variant?: "public" | "app";
}) {
  const user = await getCurrentUser();

  return (
    <SiteHeaderClient
      userName={user?.name ?? null}
      role={user?.role ?? null}
      variant={variant}
    />
  );
}
