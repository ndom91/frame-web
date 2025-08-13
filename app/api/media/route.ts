import { NextRequest, NextResponse } from "next/server";
import { listFiles, uploadFile } from "@/app/lib/r2-actions";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import sharp from "sharp";

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

		const files = await listFiles(prefix);

		return NextResponse.json(files);
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

		if (!file.type.startsWith("image/")) {
			return NextResponse.json(
				{ error: "Only image files are allowed" },
				{ status: 400 },
			);
		}

		const buffer = Buffer.from(await file.arrayBuffer());

		const resizedBuffer = await sharp(buffer)
			.resize(1920, null, {
				withoutEnlargement: true,
			})
			.jpeg({
				quality: 85,
				progressive: true,
			})
			.toBuffer();

		const resizedFile = new File([resizedBuffer], file.name, {
			type: "image/jpeg",
		});

		const result = await uploadFile(resizedFile, key);

		const fileInfo = {
			key,
			name: file.name,
			size: resizedBuffer.length,
			type: "image/jpeg",
			url: `https://${process.env.NEXT_PUBLIC_IMAGE_HOSTNAME}/${key}`,
			lastmodified: new Date(),
			etag: result.ETag?.replace(/"/g, "") || "",
		};

		return NextResponse.json(fileInfo, { status: 201 });
	} catch (error) {
		console.error("Error uploading file:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 },
		);
	}
}
