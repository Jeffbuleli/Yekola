import Image from "next/image";
import Link from "next/link";
import { CourseCoverIcon } from "@/components/icons";
import { formatFc } from "@/lib/plans";

type CourseCardProps = {
  href: string;
  coverIcon: string;
  coverImage?: string | null;
  title: string;
  detail: string;
  priceCdf?: number;
  meta?: string;
  dark?: boolean;
  liveRequired?: boolean;
};

/** Image/SVG à gauche, titre à droite, détail / prix en bas. */
export function CourseCard({
  href,
  coverIcon,
  coverImage,
  title,
  detail,
  priceCdf,
  meta,
  dark = false,
  liveRequired,
}: CourseCardProps) {
  return (
    <Link
      href={href}
      className={
        dark
          ? "block overflow-hidden rounded-xl border border-emerald-500/20 bg-black/50 transition hover:border-[var(--yk-mint)]/50"
          : "yk-card block !p-0 overflow-hidden transition hover:border-[var(--yk-lime)]"
      }
    >
      {coverImage ? (
        <div className="relative aspect-[16/9] w-full bg-[var(--yk-paper)]">
          <Image src={coverImage} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
          {liveRequired && (
            <span className="absolute left-2 top-2 rounded-md bg-[var(--yk-amber)] px-2 py-0.5 text-[10px] font-bold text-[#1a1205]">
              Live requis
            </span>
          )}
        </div>
      ) : null}
      <div className={coverImage ? "p-4" : dark ? "p-4" : "p-4"}>
        <div className="flex items-start gap-3">
          {!coverImage && (
            <CourseCoverIcon
              name={coverIcon}
              size={dark ? 22 : 26}
              className={
                dark
                  ? "bg-black/40 text-[var(--yk-mint)]"
                  : "bg-[var(--yk-paper)] text-[var(--yk-forest)]"
              }
            />
          )}
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
            {meta ? <p className="text-xs text-[var(--yk-muted)]">{meta}</p> : <span />}
            {priceCdf !== undefined && (
              <p className="font-display font-bold text-[var(--yk-amber)]">{formatFc(priceCdf)}</p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

type InlineCourseHeadProps = {
  coverIcon: string;
  coverImage?: string | null;
  title: string;
  detail?: string;
  size?: number;
  liveRequired?: boolean;
};

export function CourseHead({
  coverIcon,
  coverImage,
  title,
  detail,
  size = 28,
  liveRequired,
}: InlineCourseHeadProps) {
  return (
    <div>
      {coverImage && (
        <div className="relative mb-4 aspect-[21/9] w-full overflow-hidden rounded-2xl bg-[var(--yk-line)]">
          <Image src={coverImage} alt="" fill className="object-cover" sizes="100vw" priority />
          {liveRequired && (
            <span className="absolute left-3 top-3 rounded-md bg-[var(--yk-amber)] px-2 py-1 text-[10px] font-bold text-[#1a1205]">
              Sessions live requises
            </span>
          )}
        </div>
      )}
      <div className="flex items-start gap-3">
        {!coverImage && <CourseCoverIcon name={coverIcon} size={size} />}
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
