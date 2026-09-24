import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, className, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
    ...rest,
  };
}

export function IconCode(props: IconProps) {
  return (
    <svg {...base(props)}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2 7.5A2.5 2.5 0 0 1 4.5 5h13A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 2 16.5v-9Z" />
      <path d="M16 12h4v2h-4a1 1 0 0 1 0-2Z" />
      <path d="M2 9h18" />
    </svg>
  );
}

export function IconStore(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 9 5.5 4h13L21 9" />
      <path d="M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" />
      <path d="M9 20v-6h6v6" />
      <path d="M3 9h18" />
    </svg>
  );
}

export function IconBook(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function IconOffline(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12.5a8 8 0 0 1 11.5-7.2" />
      <path d="M8.5 15a4.5 4.5 0 0 1 6.3-4.1" />
      <path d="M12 19h.01" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

export function IconSell(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="9" r="2.5" />
      <path d="M14.5 6.5 20 12l-7.5 7.5L5 12V6.5h7.5Z" />
    </svg>
  );
}

export function IconAcademy(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="M5 10.5v5.2L12 20l7-4.3v-5.2" />
      <path d="M19 12v6" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export type CourseIconKey = "code" | "wallet" | "store" | "book";

const COURSE_ICONS: Record<CourseIconKey, ComponentType<IconProps>> = {
  code: IconCode,
  wallet: IconWallet,
  store: IconStore,
  book: IconBook,
};

export function CourseCoverIcon({
  name,
  size = 28,
  className = "bg-[var(--yk-paper)] text-[var(--yk-forest)]",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const key = (name in COURSE_ICONS ? name : "book") as CourseIconKey;
  const Comp = COURSE_ICONS[key];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl ${className}`}
      style={{ width: size + 16, height: size + 16 }}
    >
      <Comp size={size} />
    </span>
  );
}
