import { createHash, randomBytes } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { frameApiKey } from "@/db/frameApiKey.sql";
import { frame } from "@/db/frame.sql";
import { usersToFrames } from "@/db/frameOnUser.sql";

function hashApiKey(apiKey: string) {
	return createHash("sha256").update(apiKey).digest("hex");
}

export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Restricted" }, { status: 403 });
	}

	try {
		if (request.nextUrl.protocol !== "https:") {
			return NextResponse.json({ error: "Frame metrics require HTTPS" }, { status: 400 });
		}
		const { title, frameId } = await request.json();
		if (typeof title !== "string" || !title.trim() || typeof frameId !== "string" || !frameId) {
			return NextResponse.json({ error: "Frame title and ID are required" }, { status: 400 });
		}

		const existingFrame = await db.query.frame.findFirst({
			where: eq(frame.frameId, frameId),
		});
		let frameRecord: typeof frame.$inferSelect;

		if (!existingFrame) {
			const created = await db
				.insert(frame)
				.values({
					title: title.trim(),
					frameId,
					location: "",
					model: "",
				})
				.returning();
			const createdFrame = created[0];
			if (!createdFrame) {
				throw new Error("Frame creation returned no record");
			}
			frameRecord = createdFrame;
			await db.insert(usersToFrames).values({
				userId: session.user.id,
				frameId: frameRecord.id,
				role: "ADMIN",
			});
		} else {
			const access = await db.query.usersToFrames.findFirst({
				where: (access, { and, eq }) =>
					and(eq(access.userId, session.user.id), eq(access.frameId, existingFrame.id)),
			});
			if (!access || access.role !== "ADMIN") {
				return NextResponse.json({ error: "Frame belongs to another account" }, { status: 403 });
			}
			frameRecord = existingFrame;
		}

		const apiKey = randomBytes(32).toString("hex");
		await db.transaction(async (transaction) => {
			await transaction
				.delete(frameApiKey)
				.where(and(eq(frameApiKey.frameId, frameRecord.id), isNull(frameApiKey.activatedAt)));
			await transaction.insert(frameApiKey).values({
				frameId: frameRecord.id,
				keyHash: hashApiKey(apiKey),
				expiresAt: new Date(Date.now() + 60 * 60 * 1000),
			});
		});

		return NextResponse.json(
			{ apiEndpoint: request.nextUrl.origin, apiKey, frame: frameRecord },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error registering frame:", error);
		return NextResponse.json({ error: "Failed to register frame" }, { status: 500 });
	}
}
