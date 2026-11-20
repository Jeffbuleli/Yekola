import { piHostIsTestnet } from "@/lib/pi/host";

/** Pioneer-only sur pi-test / localhost / Sandbox Pi — pas sur yekola.mcbuleli.com (Mainnet). */
export function piConnectOnly(): boolean {
  return piHostIsTestnet();
}