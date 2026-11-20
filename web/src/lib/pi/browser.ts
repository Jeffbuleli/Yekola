"use client";

export type PiAuthResult = {
  accessToken: string;
  user: { uid: string; username: string };
};

type PiSdk = {
  init: (config: { version: string; sandbox?: boolean }) => void | Promise<void>;
  authenticate: (
    scopes: string[],
    onIncomplete: (payment: unknown) => void | Promise<void>,
  ) => Promise<PiAuthResult>;
  createPayment: (
    payment: { amount: number; memo: string; metadata: Record<string, string> },
    callbacks: {
      onReadyForServerApproval: (paymentId: string) => void;
      onReadyForServerCompletion: (paymentId: string, txid: string) => void;
      onCancel: (paymentId: string) => void;
      onError: (error: Error, payment?: unknown) => void;
    },
  ) => void;
};

declare global {
  interface Window {
    Pi?: PiSdk;
  }
}

import { piHostIsTestnet } from "@/lib/pi/host";

export function piSandbox(): boolean {
  return piHostIsTestnet();
}

export function loadPiSdk(): Promise<PiSdk> {
  if (typeof window === "undefined") return Promise.reject(new Error("no_window"));
  if (window.Pi) return Promise.resolve(window.Pi);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-pi-sdk="1"]');
    const finish = () => {
      if (window.Pi) resolve(window.Pi);
      else reject(new Error("Le SDK Pi n’a pas chargé. Ouvrez Yekola dans Pi Browser."));
    };
    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("SDK Pi inaccessible")), {
        once: true,
      });
      window.setTimeout(finish, 50);
      return;
    }
    const s = document.createElement("script");
    s.dataset.piSdk = "1";
    s.src = "https://sdk.minepi.com/pi-sdk.js";
    s.async = true;
    s.onload = finish;
    s.onerror = () => reject(new Error("SDK Pi inaccessible depuis ce réseau"));
    document.head.appendChild(s);
  });
}

export async function piInit(): Promise<PiSdk> {
  const Pi = await loadPiSdk();
  await Promise.resolve(Pi.init({ version: "2.0", sandbox: piSandbox() }));
  return Pi;
}
