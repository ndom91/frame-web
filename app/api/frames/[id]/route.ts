import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { frame } from "@/db/frame.sql";
import { eq } from "drizzle-orm";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const frameId = parseInt(id);

		if (isNaN(frameId)) {
			return NextResponse.json({ error: "Invalid frame ID" }, { status: 400 });
		}

		const frameResult = await db.query.frame.findFirst({
			where: eq(frame.id, frameId),
		});

		if (!frameResult) {
			return NextResponse.json({ error: "Frame not found" }, { status: 404 });
		}

		return NextResponse.json(frameResult);
	} catch (error) {
		console.error("Error fetching frame:", error);
		return NextResponse.json(
			{ error: "Failed to fetch frame" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const frameId = parseInt(id);

		if (isNaN(frameId)) {
			return NextResponse.json({ error: "Invalid frame ID" }, { status: 400 });
		}

		const body = await request.json();
		const { title, location, model, status } = body;

		const updatedFrame = await db
			.update(frame)
			.set({
				...(title && { title }),
				...(location && { location }),
				...(model && { model }),
				...(status && { status }),
				updatedAt: new Date(),
			})
			.where(eq(frame.id, frameId))
			.returning();

		if (updatedFrame.length === 0) {
			return NextResponse.json({ error: "Frame not found" }, { status: 404 });
		}

		return NextResponse.json(updatedFrame[0]);
	} catch (error) {
		console.error("Error updating frame:", error);
		return NextResponse.json(
			{ error: "Failed to update frame" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const frameId = parseInt(id);

		if (isNaN(frameId)) {
			return NextResponse.json({ error: "Invalid frame ID" }, { status: 400 });
		}

		const deletedFrame = await db
			.delete(frame)
			.where(eq(frame.id, frameId))
			.returning();

		if (deletedFrame.length === 0) {
			return NextResponse.json({ error: "Frame not found" }, { status: 404 });
		}

		return NextResponse.json({ message: "Frame deleted successfully" });
	} catch (error) {
		console.error("Error deleting frame:", error);
		return NextResponse.json(
			{ error: "Failed to delete frame" },
			{ status: 500 },
		);
	}
}

