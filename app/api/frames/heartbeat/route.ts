import { createHash } from "crypto";
import { and, eq, isNull, ne } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/app/lib/db";
import { frameApiKey } from "@/db/frameApiKey.sql";
import { frame } from "@/db/frame.sql";

function hashApiKey(apiKey: string) {
	return createHash("sha256").update(apiKey).digest("hex");
}

export async function POST(request: NextRequest) {
	const authorization = request.headers.get("authorization");
	if (!authorization?.startsWith("Bearer ")) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { uptimeSeconds, storageTotalBytes, storageAvailableBytes, activeImage } = await request.json();
		if (!Number.isSafeInteger(uptimeSeconds) || uptimeSeconds < 0) {
			return NextResponse.json({ error: "Invalid uptime" }, { status: 400 });
		}
		if (
			(storageTotalBytes !== undefined && (!Number.isSafeInteger(storageTotalBytes) || storageTotalBytes < 0)) ||
			(storageAvailableBytes !== undefined && (!Number.isSafeInteger(storageAvailableBytes) || storageAvailableBytes < 0)) ||
			(activeImage !== undefined && (typeof activeImage !== "string" || activeImage.includes("/")))
		) {
			return NextResponse.json({ error: "Invalid metrics" }, { status: 400 });
		}
		const metrics = {
			status: "online" as const,
			lastSeenAt: new Date(),
			uptimeSeconds,
			...(storageTotalBytes !== undefined && { storageTotalBytes }),
			...(storageAvailableBytes !== undefined && { storageAvailableBytes }),
			...(activeImage && { activeImage }),
			updatedAt: new Date(),
		};

		const credential = await db.query.frameApiKey.findFirst({
			where: eq(frameApiKey.keyHash, hashApiKey(authorization.slice(7))),
		});
		if (!credential) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		if (!credential.activatedAt && credential.expiresAt < new Date()) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!credential.activatedAt) {
			const activated = await db.transaction(async (transaction) => {
				const updated = await transaction
					.update(frameApiKey)
					.set({ activatedAt: new Date() })
					.where(and(eq(frameApiKey.id, credential.id), isNull(frameApiKey.activatedAt)))
					.returning();
				if (updated.length === 0) return false;
				await transaction
					.delete(frameApiKey)
					.where(and(eq(frameApiKey.frameId, credential.frameId), ne(frameApiKey.id, credential.id)));
				await transaction
					.update(frame)
					.set(metrics)
					.where(eq(frame.id, credential.frameId));
				return true;
			});
			if (!activated) {
				return new NextResponse(null, { status: 204 });
			}
		} else {
			await db
				.update(frame)
				.set(metrics)
				.where(eq(frame.id, credential.frameId));
		}

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		console.error("Error recording frame heartbeat:", error);
		return NextResponse.json({ error: "Failed to record heartbeat" }, { status: 500 });
	}
}
