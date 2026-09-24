export type UserRole = "teacher" | "learner" | "admin";

export type PlanId = "free" | "base" | "pro" | "max";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  academyId: string | null;
  createdAt: string;
  /** ISO date when email was confirmed; null = pending. */
  emailVerifiedAt: string | null;
  emailVerifyTokenHash: string | null;
  emailVerifyExpiresAt: string | null;
  passwordResetTokenHash: string | null;
  passwordResetExpiresAt: string | null;
};

export type Academy = {
  id: string;
  slug: string;
  name: string;
  ownerId: string;
  city: string;
  bio: string;
  planId: PlanId;
  subscriptionStatus: "active" | "trialing" | "past_due" | "canceled";
  subscriptionExpiresAt: string | null;
  walletBalanceCdf: number;
  createdAt: string;
};

export type MediaKind = "image" | "video" | "file";

export type LessonMedia = {
  id: string;
  kind: MediaKind;
  name: string;
  url: string;
  sizeBytes?: number;
};

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  body: string;
  order: number;
  media: LessonMedia[];
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export type CourseModule = {
  id: string;
  title: string;
  summary: string;
  order: number;
  lessons: Lesson[];
  quiz: QuizQuestion[];
};

export type LiveSession = {
  id: string;
  title: string;
  startsAt: string;
  durationMin: number;
  required: boolean;
  meetUrl?: string;
};

export type Course = {
  id: string;
  academyId: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Prix du cours en francs congolais. */
  priceCdf: number;
  currency: "CDF";
  status: "draft" | "pending_review" | "published" | "rejected";
  /** Motif de refus admin (si rejected). */
  reviewNote: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  modules: CourseModule[];
  /** Clé d'icône SVG : code | wallet | store | book */
  coverIcon: string;
  /** Image de couverture (URL publique). */
  coverImage: string | null;
  /** Au moins une session live obligatoire. */
  liveRequired: boolean;
  liveSessions: LiveSession[];
  createdAt: string;
  updatedAt: string;
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  academyId: string;
  amountPaidCdf: number;
  platformFeeCdf: number;
  teacherNetCdf: number;
  paymentRef: string;
  paymentProvider: string;
  offlinePackUnlocked: boolean;
  purchasedAt: string;
};

export type ProgressRecord = {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string | null;
  completedLessonIds: string[];
  quizScores: Record<string, number>;
  percent: number;
  updatedAt: string;
};

export type Certificate = {
  id: string;
  code: string;
  userId: string;
  courseId: string;
  learnerName: string;
  courseTitle: string;
  academyName: string;
  teacherName: string;
  skills: string[];
  issuedAt: string;
};

export type WalletTx = {
  id: string;
  academyId: string;
  type: "sale" | "subscription" | "withdrawal" | "fee";
  amountCdf: number;
  description: string;
  reference: string;
  createdAt: string;
};

export type SubscriptionPayment = {
  id: string;
  academyId: string;
  planId: PlanId;
  amountCdf: number;
  provider: string;
  reference: string;
  status: "demo" | "pending" | "paid" | "failed";
  createdAt: string;
};

export type PaymentKind = "course_purchase" | "teacher_subscription" | "withdrawal";

export type PaymentIntent = {
  id: string;
  reference: string;
  kind: PaymentKind;
  status: "demo" | "pending" | "paid" | "failed";
  amountCdf: number;
  currency: "CDF";
  msisdn: string | null;
  momoProvider: string | null;
  userId: string;
  courseId: string | null;
  academyId: string | null;
  planId: PlanId | null;
  provider: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  fulfilledAt: string | null;
};

export type SyncAccepted = {
  id: string;
  acceptedAt: string;
};

export type SessionRecord = {
  tokenHash: string;
  userId: string;
  expiresAt: string;
};

export type PasskeyRecord = {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  deviceName: string | null;
  transports: string[] | null;
  createdAt: string;
};

export type WebAuthnChallenge = {
  id: string;
  userId: string | null;
  purpose: "passkey_register" | "passkey_login" | "passkey_stepup";
  challenge: string;
  expiresAt: string;
};

export type DbShape = {
  seedVersion: number;
  users: User[];
  academies: Academy[];
  courses: Course[];
  enrollments: Enrollment[];
  progress: ProgressRecord[];
  certificates: Certificate[];
  walletTx: WalletTx[];
  subscriptions: SubscriptionPayment[];
  payments: PaymentIntent[];
  syncAccepted: SyncAccepted[];
  sessions: SessionRecord[];
  passkeys: PasskeyRecord[];
  webauthnChallenges: WebAuthnChallenge[];
};
