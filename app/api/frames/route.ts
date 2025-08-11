import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { frame } from "@/db/frame.sql";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { usersToFrames } from "@/db/frameOnUser.sql";

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		return NextResponse.json({ error: "Restricted" }, { status: 403 });
	}

	try {
		const result = await db
			.select()
			.from(frame)
			.innerJoin(usersToFrames, eq(frame.id, usersToFrames.frameId))
			.where(eq(usersToFrames.userId, session.user.id));

		if (result?.length === 0) {
			return NextResponse.json({ error: "No frames found" }, { status: 500 });
		}

		return NextResponse.json(result.map((result) => result.frame));
	} catch (error) {
		console.error("Error fetching frames:", error);
		return NextResponse.json(
			{ error: "Failed to fetch frames" },
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
		const body = await request.json();
		const { title, location, model, frameId } = body;

		if (!title || !location || !model) {
			return NextResponse.json(
				{ error: "Missing required fields: title, location, model" },
				{ status: 400 },
			);
		}

		// const frameId = `frame_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

		const newFrame = await db
			.insert(frame)
			.values({
				title,
				frameId,
				location,
				model,
				status: "offline" as const,
			})
			.returning();

		return NextResponse.json(newFrame[0], { status: 201 });
	} catch (error) {
		console.error("Error creating frame:", error);
		return NextResponse.json(
			{ error: "Failed to create frame" },
			{ status: 500 },
		);
	}
}
