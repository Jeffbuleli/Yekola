import Link from "next/link";
import { CourseCoverIcon } from "@/components/icons";
import { formatFc } from "@/lib/plans";

type CourseCardProps = {
  href: string;
  coverIcon: string;
  title: string;
  detail: string;
  priceCdf?: number;
  meta?: string;
  dark?: boolean;
};

/** SVG à gauche, titre à droite, détail / prix en bas. */
export function CourseCard({
  href,
  coverIcon,
  title,
  detail,
  priceCdf,
  meta,
  dark = false,
}: CourseCardProps) {
  return (
    <Link
      href={href}
      className={
        dark
          ? "block rounded-xl border border-emerald-500/20 bg-black/50 p-4 transition hover:border-[var(--yk-mint)]/50"
          : "yk-card block transition hover:border-[var(--yk-lime)]"
      }
    >
      <div className="flex items-start gap-3">
        <CourseCoverIcon
          name={coverIcon}
          size={dark ? 22 : 26}
          className={
            dark
              ? "bg-black/40 text-[var(--yk-mint)]"
              : "bg-[var(--yk-paper)] text-[var(--yk-forest)]"
          }
        />
        <h3
          className={
            dark
              ? "min-w-0 flex-1 font-display text-base font-bold leading-snug sm:text-lg"
              : "min-w-0 flex-1 font-display text-base font-bold leading-snug text-[var(--yk-forest)] sm:text-lg"
          }
        >
          {title}
        </h3>
      </div>
      <p
        className={
          dark
            ? "mt-2 line-clamp-2 text-sm text-[#b7c9be]"
            : "mt-2 line-clamp-2 text-sm text-[var(--yk-muted)]"
        }
      >
        {detail}
      </p>
      {(meta || priceCdf !== undefined) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {meta ? (
            <p className="text-xs text-[var(--yk-muted)]">{meta}</p>
          ) : (
            <span />
          )}
          {priceCdf !== undefined && (
            <p
              className={
                dark
                  ? "font-display font-bold text-[var(--yk-amber)]"
                  : "font-display font-bold text-[var(--yk-amber)]"
              }
            >
              {formatFc(priceCdf)}
            </p>
          )}
        </div>
      )}
    </Link>
  );
}

type InlineCourseHeadProps = {
  coverIcon: string;
  title: string;
  detail?: string;
  size?: number;
};

/** En-tête page cours / learn : SVG | titre, détail sous la rangée. */
export function CourseHead({
  coverIcon,
  title,
  detail,
  size = 28,
}: InlineCourseHeadProps) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <CourseCoverIcon name={coverIcon} size={size} />
        <h1 className="min-w-0 flex-1 font-display text-2xl font-bold leading-snug text-[var(--yk-forest)] sm:text-3xl">
          {title}
        </h1>
      </div>
      {detail ? (
        <p className="mt-2 text-sm text-[var(--yk-muted)] sm:text-base">{detail}</p>
      ) : null}
    </div>
  );
}
