import { NextRequest, NextResponse } from "next/server";
import { deleteFile, listFiles, uploadFile } from "@/app/lib/r2-actions";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import pRetry from "p-retry";
import { db } from "@/app/lib/db";
import { media } from "@/db/media.sql";
import { user } from "@/db/user.sql";
import { frame } from "@/db/frame.sql";
import { usersToFrames } from "@/db/frameOnUser.sql";
import { attachImageCookie } from "@/app/lib/image-cookie";
import { getAccessibleFrameIds } from "@/app/lib/frame-access";
import { imageUrl } from "@/app/lib/image-url";
import { and, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		return NextResponse.json({ error: "Restricted" }, { status: 403 });
	}

	try {
		const { searchParams } = new URL(request.url);
		const prefix = searchParams.get("prefix") || "";
		if (!prefix) {
			return NextResponse.json(
				{ error: "A frame prefix is required" },
				{ status: 400 },
			);
		}

		const frameRecord = await db.query.frame.findFirst({
			where: eq(frame.frameId, prefix),
		});
		if (!frameRecord) {
			return NextResponse.json({ error: "Frame not found" }, { status: 404 });
		}
		const membership = await db.query.usersToFrames.findFirst({
			where: and(
				eq(usersToFrames.frameId, frameRecord.id),
				eq(usersToFrames.userId, session.user.id),
			),
		});
		if (!membership) {
			return NextResponse.json({ error: "Restricted" }, { status: 403 });
		}
		const mediaQuery = db
			.select({ url: media.url, uploadedBy: user.name })
			.from(media)
			.leftJoin(user, eq(media.createdBy, user.id));
		const mediaRecords = await mediaQuery.where(
			eq(media.frameId, String(frameRecord.id)),
		);
		const files = await listFiles(`${prefix}/`);
		const uploadedByUrl = new Map(
			mediaRecords.map((record) => [record.url, record.uploadedBy ?? undefined]),
		);

		const response = NextResponse.json(
			files.map((file) => ({
				...file,
				uploadedBy: uploadedByUrl.get(file.url),
			})),
		);
		// Every frame, not just this one: the cookie is replaced on each request,
		// so scoping it to `prefix` would revoke images already on screen from a
		// previously viewed frame.
		await attachImageCookie(
			response,
			request,
			await getAccessibleFrameIds(session.user.id),
		);
		return response;
	} catch (error) {
		console.error("Error fetching media files:", error);
		return NextResponse.json(
			{ error: "Failed to fetch media files" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		return NextResponse.json({ error: "Restricted" }, { status: 403 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const key = formData.get("key") as string;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		if (!key) {
			return NextResponse.json({ error: "No key provided" }, { status: 400 });
		}
		const frameKey = key.split("/")[0];
		const frameRecord = await db.query.frame.findFirst({
			where: eq(frame.frameId, frameKey),
		});
		if (!frameRecord) {
			return NextResponse.json({ error: "Frame not found" }, { status: 404 });
		}
		const membership = await db.query.usersToFrames.findFirst({
			where: and(
				eq(usersToFrames.frameId, frameRecord.id),
				eq(usersToFrames.userId, session.user.id),
			),
		});
		if (!membership || membership.role === "READ") {
			return NextResponse.json({ error: "Restricted" }, { status: 403 });
		}
		const fileUrl = imageUrl(key);
		const existingMedia = await db.query.media.findFirst({
			where: eq(media.url, fileUrl),
		});

		if (!file.type.startsWith("image/")) {
			return NextResponse.json(
				{ error: "Only image files are allowed" },
				{ status: 400 },
			);
		}

		// Image is already processed client-side, just upload directly
		const result = await pRetry(
			() => uploadFile(file, key),
			{
				retries: 3,
				minTimeout: 1000,
				maxTimeout: 5000,
				onFailedAttempt: (error) => {
					console.warn(`Upload attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`);
				},
			}
		);

		const fileInfo = {
			key,
			name: file.name,
			size: file.size,
			type: file.type,
			url: fileUrl,
			lastmodified: new Date(),
			etag: result.ETag?.replace(/"/g, "") || "",
		};
		try {
			if (existingMedia) {
				await db
					.update(media)
					.set({
						title: file.name,
						createdBy: session.user.id,
						frameId: String(frameRecord.id),
						updatedAt: new Date(),
					})
					.where(eq(media.id, existingMedia.id));
			} else {
				await db.insert(media).values({
					title: file.name,
					url: fileInfo.url,
					createdBy: session.user.id,
					frameId: String(frameRecord.id),
				});
			}
		} catch (error) {
			if (!existingMedia) {
				await deleteFile(key).catch((cleanupError) => {
					console.error("Failed to clean up uploaded media:", cleanupError);
				});
			}
			throw error;
		}

		return NextResponse.json(
			{ ...fileInfo, uploadedBy: session.user.name },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error uploading file:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 },
		);
	}
}
