/** Lien Meet audio-first via McBuleli Live (Jitsi). */

export const MEET_ROOM = "yekola-demo";

export function buildMeetUrl(room = MEET_ROOM) {
  const base = process.env.NEXT_PUBLIC_MEET_BASE_URL || "https://live.mcbuleli.org";
  const hash = "#config.startWithVideoMuted=true&config.startWithAudioMuted=false";
  return `${base}/${encodeURIComponent(room)}${hash}`;
}

export function courseMeetRoom(courseId: string, academySlug?: string) {
  const base = (academySlug || "yekola").slice(0, 24).replace(/[^a-z0-9-]/gi, "");
  return `yekola-${base}-${courseId.slice(-8)}`.toLowerCase();
}

export function courseMeetUrl(courseId: string, academySlug?: string) {
  return buildMeetUrl(courseMeetRoom(courseId, academySlug));
}
