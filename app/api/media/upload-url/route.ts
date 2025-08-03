import { NextRequest, NextResponse } from "next/server";
import { getSignedUrlForUpload } from "@/app/lib/r2-actions";

export async function POST(request: NextRequest) {
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

