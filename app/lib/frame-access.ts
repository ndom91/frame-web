import { eq } from "drizzle-orm";

import { db } from "@/app/lib/db";
import { frame } from "@/db/frame.sql";
import { usersToFrames } from "@/db/frameOnUser.sql";

/**
 * Every frame the user can see, as R2 key prefixes (`frame.frameId`).
 *
 * Used to populate the image cookie. Deliberately the *whole* set rather than
 * just the frame being viewed: the cookie is replaced on each request, so a
 * per-frame cookie would revoke images still on screen from a frame the user
 * navigated away from.
 */
export async function getAccessibleFrameIds(userId: string): Promise<string[]> {
	const rows = await db
		.select({ frameId: frame.frameId })
		.from(frame)
		.innerJoin(usersToFrames, eq(frame.id, usersToFrames.frameId))
		.where(eq(usersToFrames.userId, userId));

	return rows.map((row) => row.frameId);
}
