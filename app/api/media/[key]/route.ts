import { NextRequest, NextResponse } from "next/server";
import { deleteFile, getSignedUrlForDownload } from "@/app/lib/r2-actions";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { media } from "@/db/media.sql";
import { frame } from "@/db/frame.sql";
import { usersToFrames } from "@/db/frameOnUser.sql";
import { imageUrl } from "@/app/lib/image-url";
import { and, eq } from "drizzle-orm";

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ key: string }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		return NextResponse.json({ error: "Restricted" }, { status: 403 });
	}

	try {
		const { key } = await params;
		const decodedKey = decodeURIComponent(key);

		if (!decodedKey) {
			return NextResponse.json({ error: "No key provided" }, { status: 400 });
		}
		const frameRecord = await db.query.frame.findFirst({
			where: eq(frame.frameId, decodedKey.split("/")[0]),
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

		await deleteFile(decodedKey);
		try {
			await db.delete(media).where(eq(media.url, imageUrl(decodedKey)));
		} catch (error) {
			console.error("Failed to delete media metadata:", error);
		}

		return NextResponse.json({ message: "File deleted successfully" });
	} catch (error) {
		console.error("Error deleting file:", error);
		return NextResponse.json(
			{ error: "Failed to delete file" },
			{ status: 500 },
		);
	}
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ key: string }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		return NextResponse.json({ error: "Restricted" }, { status: 403 });
	}

	try {
		const { key } = await params;
		const decodedKey = decodeURIComponent(key);
		const { searchParams } = new URL(request.url);
		const action = searchParams.get("action");

		if (!decodedKey) {
			return NextResponse.json({ error: "No key provided" }, { status: 400 });
		}
		const frameRecord = await db.query.frame.findFirst({
			where: eq(frame.frameId, decodedKey.split("/")[0]),
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

		if (action === "download") {
			const signedUrl = await getSignedUrlForDownload(decodedKey);
			return NextResponse.json({ url: signedUrl });
		}

		return NextResponse.json({
			key: decodedKey,
			message: "Use ?action=download to get signed download URL",
		});
	} catch (error) {
		console.error("Error processing file request:", error);
		return NextResponse.json(
			{ error: "Failed to process file request" },
			{ status: 500 },
		);
	}
}
