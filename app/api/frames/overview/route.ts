import { NextResponse } from "next/server";
import { eq, inArray, sql } from "drizzle-orm";

import { db } from "@/app/lib/db";
import { frame } from "@/db/frame.sql";
import { media } from "@/db/media.sql";
import { usersToFrames } from "@/db/frameOnUser.sql";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

export type FrameOverview = {
	id: number;
	frameId: string;
	title: string;
	mediaCount: number;
	previewUrl: string | null;
};

/**
 * Per-frame photo counts and a preview image, for the dashboard.
 *
 * The dashboard used to fetch the *complete* media listing for every frame and
 * call `.length` on it — downloading every file's metadata to produce a number.
 * Both values here come from SQL against `media`, which is authoritative now
 * that it's backfilled from R2 and kept in sync by the upload and delete routes.
 */
export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Restricted" }, { status: 403 });
	}

	try {
		const frames = await db
			.select({
				id: frame.id,
				frameId: frame.frameId,
				title: frame.title,
			})
			.from(frame)
			.innerJoin(usersToFrames, eq(frame.id, usersToFrames.frameId))
			.where(eq(usersToFrames.userId, session.user.id));

		if (frames.length === 0) {
			return NextResponse.json([]);
		}

		// media.frame_id stores frame.id as text, matching POST /api/media.
		const frameKeys = frames.map((row) => String(row.id));

		const counts = await db
			.select({
				frameId: media.frameId,
				count: sql<number>`count(*)`.as("count"),
			})
			.from(media)
			.where(inArray(media.frameId, frameKeys))
			.groupBy(media.frameId);

		// Newest row per frame, without pulling every row back.
		const ranked = db.$with("ranked").as(
			db
				.select({
					frameId: media.frameId,
					url: media.url,
					rank: sql<number>`row_number() over (
						partition by ${media.frameId}
						order by ${media.createdAt} desc, ${media.id} desc
					)`.as("rank"),
				})
				.from(media)
				.where(inArray(media.frameId, frameKeys)),
		);

		const previews = await db
			.with(ranked)
			.select({ frameId: ranked.frameId, url: ranked.url })
			.from(ranked)
			.where(eq(ranked.rank, 1));

		const countByFrame = new Map(counts.map((row) => [row.frameId, row.count]));
		const previewByFrame = new Map(previews.map((row) => [row.frameId, row.url]));

		const overview: FrameOverview[] = frames.map((row) => ({
			id: row.id,
			frameId: row.frameId,
			title: row.title,
			mediaCount: countByFrame.get(String(row.id)) ?? 0,
			previewUrl: previewByFrame.get(String(row.id)) ?? null,
		}));

		return NextResponse.json(overview);
	} catch (error) {
		console.error("Error building frames overview:", error);
		return NextResponse.json(
			{ error: "Failed to build frames overview" },
			{ status: 500 },
		);
	}
}
