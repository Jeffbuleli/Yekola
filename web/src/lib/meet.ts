import { MEET_ROOM } from "@/lib/seed/demo-data";

/** Lien Meet audio-first via McBuleli Live (Jitsi). */
export function buildMeetUrl(room = MEET_ROOM) {
  const base = process.env.NEXT_PUBLIC_MEET_BASE_URL || "https://live.mcbuleli.org";
  // Config hash: audio preference hints for low bandwidth demos
  const hash = "#config.startWithVideoMuted=true&config.startWithAudioMuted=false";
  return `${base}/${encodeURIComponent(room)}${hash}`;
}
