export const FRAME_OFFLINE_AFTER_MS = 20 * 60 * 1000;

export function frameStatus(lastSeenAt: Date | null) {
	if (!lastSeenAt || Date.now() - lastSeenAt.getTime() > FRAME_OFFLINE_AFTER_MS) {
		return "offline" as const;
	}
	return "online" as const;
}
