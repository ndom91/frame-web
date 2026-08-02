import { NextRequest, NextResponse } from "next/server";
import { getSignedUrlForUpload } from "@/app/lib/r2-actions";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { db } from "@/app/lib/db";
import { frame } from "@/db/frame.sql";
import { usersToFrames } from "@/db/frameOnUser.sql";
import { and, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		return NextResponse.json({ error: "Restricted" }, { status: 403 });
	}

	try {
		const { key, contentType } = await request.json();

		if (!key) {
			return NextResponse.json({ error: "Key is required" }, { status: 400 });
		}

		if (!contentType) {
			return NextResponse.json(
				{ error: "Content type is required" },
				{ status: 400 },
			);
		}

		if (!contentType.startsWith("image/")) {
			return NextResponse.json(
				{ error: "Only image files are allowed" },
				{ status: 400 },
			);
		}
		const frameRecord = await db.query.frame.findFirst({
			where: eq(frame.frameId, key.split("/")[0]),
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

		const signedUrl = await getSignedUrlForUpload(key, contentType);

		return NextResponse.json({
			uploadUrl: signedUrl,
			key,
			contentType,
			fileUrl: `https://${process.env.NEXT_PUBLIC_IMAGE_HOSTNAME}/${key}`,
		});
	} catch (error) {
		console.error("Error generating upload URL:", error);
		return NextResponse.json(
			{ error: "Failed to generate upload URL" },
			{ status: 500 },
		);
	}
}
