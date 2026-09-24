import { sendEmail, appBaseUrl } from "./resend";
import {
  passwordChangedEmail,
  passwordResetEmail,
  purchaseConfirmEmail,
  verifyAccountEmail,
  welcomeEmail,
} from "./templates";

export async function notifyVerifyAccount(args: {
  to: string;
  name: string;
  rawToken: string;
}) {
  const verifyUrl = `${appBaseUrl()}/auth/verify?token=${encodeURIComponent(args.rawToken)}`;
  const msg = verifyAccountEmail({ name: args.name, verifyUrl });
  return sendEmail({ to: args.to, ...msg });
}

export async function notifyWelcome(args: {
  to: string;
  name: string;
  role: string;
}) {
  const msg = welcomeEmail({ name: args.name, role: args.role });
  return sendEmail({ to: args.to, ...msg });
}

export async function notifyPasswordReset(args: {
  to: string;
  name: string;
  rawToken: string;
}) {
  const resetUrl = `${appBaseUrl()}/auth/reset?token=${encodeURIComponent(args.rawToken)}`;
  const msg = passwordResetEmail({ name: args.name, resetUrl });
  return sendEmail({ to: args.to, ...msg });
}

export async function notifyPasswordChanged(args: { to: string; name: string }) {
  const msg = passwordChangedEmail({ name: args.name });
  return sendEmail({ to: args.to, ...msg });
}

export async function notifyPurchase(args: {
  to: string;
  name: string;
  courseTitle: string;
  amountCdf: number;
  courseId: string;
}) {
  const learnUrl = `${appBaseUrl()}/learn/${args.courseId}`;
  const msg = purchaseConfirmEmail({
    name: args.name,
    courseTitle: args.courseTitle,
    amountCdf: args.amountCdf,
    learnUrl,
  });
  return sendEmail({ to: args.to, ...msg });
}
