"use server";

import {
	PutObjectCommand,
	GetObjectCommand,
	ListObjectsV2Command,
	DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FileObject, r2Client } from "@/app/lib/r2";
import { imageUrl } from "@/app/lib/image-url";
import { camelCaseKeys } from "@/lib/utils";

const R2_BUCKET = process.env.R2_BUCKET!;

export async function uploadFile(file: File, key: string) {
	try {
		// Convert File to ArrayBuffer for AWS SDK compatibility
		const arrayBuffer = await file.arrayBuffer();
		const buffer = new Uint8Array(arrayBuffer);

		const command = new PutObjectCommand({
			Bucket: R2_BUCKET,
			Key: key,
			Body: buffer,
			ContentType: file.type || "application/octet-stream",
			ContentLength: file.size,
		});

		const response = await r2Client.send(command);
		console.log("UPLOAD RESPONSE", response);
		return response;
	} catch (error) {
		console.error("Error uploading file:", error);
		throw error;
	}
}

export async function getSignedUrlForUpload(
	key: string,
	contentType: string,
): Promise<string> {
	const command = new PutObjectCommand({
		Bucket: R2_BUCKET,
		Key: key,
		ContentType: contentType,
	});

	try {
		const signedUrl = await getSignedUrl(r2Client, command, {
			expiresIn: 3600,
		});
		return signedUrl;
	} catch (error) {
		console.error("Error generating signed URL:", error);
		throw error;
	}
}

export async function getSignedUrlForDownload(key: string): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: R2_BUCKET,
		Key: key,
	});

	try {
		const signedUrl = await getSignedUrl(r2Client, command, {
			expiresIn: 3600,
		});
		return signedUrl;
	} catch (error) {
		console.error("Error generating signed URL:", error);
		throw error;
	}
}

export async function listFiles(prefix: string = ""): Promise<FileObject[]> {
	try {
		const files: FileObject[] = [];
		let continuationToken: string | undefined;

		// R2 caps a ListObjectsV2 response at 1000 keys. Without following
		// NextContinuationToken, a frame with more images silently rendered only
		// the first 1000 with no error anywhere.
		do {
			const response = await r2Client.send(
				new ListObjectsV2Command({
					Bucket: R2_BUCKET,
					Prefix: prefix,
					ContinuationToken: continuationToken,
				}),
			);

			for (const image of response.Contents ?? []) {
				files.push({
					...camelCaseKeys(image),
					name: image.Key?.split("/").pop() ?? "",
					url: imageUrl(image.Key ?? ""),
				} as FileObject);
			}

			continuationToken = response.IsTruncated
				? response.NextContinuationToken
				: undefined;
		} while (continuationToken);

		return files;
	} catch (error) {
		console.error("Error listing files:", error);
		throw error;
	}
}

export async function deleteFile(key: string) {
	const command = new DeleteObjectCommand({
		Bucket: R2_BUCKET,
		Key: key,
	});

	try {
		const response = await r2Client.send(command);
		return response;
	} catch (error) {
		console.error("Error deleting file:", error);
		throw error;
	}
}
