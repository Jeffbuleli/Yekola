import { getCurrentUser } from "@/lib/auth/session";
import { SiteHeaderClient } from "@/components/site-header-client";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <SiteHeaderClient
      userName={user?.name ?? null}
      role={user?.role ?? null}
    />
  );
}
