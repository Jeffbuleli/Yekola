export type PaymentProvider = {
  id: string;
  label: string;
  initiate(input: {
    amount: number;
    currency: "CDF" | "USD";
    msisdn?: string;
    description: string;
  }): Promise<{ status: "demo" | "pending" | "paid"; reference: string; message: string }>;
};

/** DEMO uniquement - aucune fausse transaction réelle. */
export const DemoPaymentProvider: PaymentProvider = {
  id: "demo",
  label: "DemoProvider (hackathon)",
  async initiate(input) {
    return {
      status: "demo",
      reference: `DEMO-${Date.now()}`,
      message: `DEMO MODE - aucun débit réel. Simulation ${input.amount} ${input.currency} (${input.description}). PawaPay prêt à brancher post-hackathon.`,
    };
  },
};

export function getPaymentProvider(): PaymentProvider {
  // Future: MobileMoneyProvider (PawaPay) | CardProvider
  return DemoPaymentProvider;
}
