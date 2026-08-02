/**
 * Backfills the `media` table from the R2 bucket.
 *
 * Photos uploaded before the media insert landed exist as R2 objects with no
 * database row, which leaves the table non-authoritative — counts and uploader
 * attribution both come up short. This walks the bucket and inserts a row for
 * every object that doesn't already have one.
 *
 * R2 records no uploader, so backfilled rows get `user_id = NULL`. The UI hides
 * the uploader when it's absent, so historic photos render honestly rather than
 * being attributed to whoever happens to be an admin.
 *
 * Dry run by default. Pass --commit to actually write.
 *
 *   pnpm tsx scripts/backfill-media.ts
 *   pnpm tsx scripts/backfill-media.ts --commit
 */
import "dotenv/config";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@libsql/client";

const commit = process.argv.includes("--commit");

const {
	TURSO_DATABASE_URL,
	TURSO_AUTH_TOKEN,
	R2_ACCOUNT_ID,
	R2_ACCESS_KEY_ID,
	R2_SECRET_ACCESS_KEY,
	R2_BUCKET,
	NEXT_PUBLIC_IMAGE_HOSTNAME,
} = process.env;

for (const [key, value] of Object.entries({
	TURSO_DATABASE_URL,
	TURSO_AUTH_TOKEN,
	R2_ACCOUNT_ID,
	R2_ACCESS_KEY_ID,
	R2_SECRET_ACCESS_KEY,
	R2_BUCKET,
	NEXT_PUBLIC_IMAGE_HOSTNAME,
})) {
	if (!value) {
		console.error(`Missing required env var: ${key}`);
		process.exit(1);
	}
}

const db = createClient({
	url: TURSO_DATABASE_URL!,
	authToken: TURSO_AUTH_TOKEN!,
});

const r2 = new S3Client({
	region: "auto",
	endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID!,
		secretAccessKey: R2_SECRET_ACCESS_KEY!,
	},
});

type R2Object = { key: string; lastModified: Date };

/** Follows NextContinuationToken; a single response caps at 1000 keys. */
async function listAllObjects(): Promise<R2Object[]> {
	const objects: R2Object[] = [];
	let continuationToken: string | undefined;

	do {
		const response = await r2.send(
			new ListObjectsV2Command({
				Bucket: R2_BUCKET,
				ContinuationToken: continuationToken,
			}),
		);

		for (const object of response.Contents ?? []) {
			if (!object.Key || object.Key.endsWith("/")) continue;
			objects.push({
				key: object.Key,
				lastModified: object.LastModified ?? new Date(),
			});
		}

		continuationToken = response.IsTruncated
			? response.NextContinuationToken
			: undefined;
	} while (continuationToken);

	return objects;
}

async function main() {
	const objects = await listAllObjects();

	// `media.frame_id` holds frame.id as text, matching what POST /api/media writes.
	const frames = await db.execute("select id, frameId from frame");
	const frameIdByPrefix = new Map(
		frames.rows.map((row) => [String(row.frameId), String(row.id)]),
	);

	const existingUrls = new Set(
		(await db.execute("select url from media")).rows.map((row) =>
			String(row.url),
		),
	);

	const toInsert: {
		title: string;
		url: string;
		frameId: string;
		timestamp: number;
	}[] = [];
	const unmatched: string[] = [];
	let alreadyPresent = 0;

	for (const object of objects) {
		const prefix = object.key.split("/")[0];
		const frameId = frameIdByPrefix.get(prefix);

		if (!frameId) {
			unmatched.push(object.key);
			continue;
		}

		// Must match byte-for-byte: both the uploader join and the delete path
		// key off this exact string.
		const url = `https://${NEXT_PUBLIC_IMAGE_HOSTNAME}/${object.key}`;
		if (existingUrls.has(url)) {
			alreadyPresent++;
			continue;
		}

		toInsert.push({
			title: object.key.split("/").pop() ?? object.key,
			url,
			frameId,
			// Drizzle `timestamp` mode stores seconds, not milliseconds.
			timestamp: Math.floor(object.lastModified.getTime() / 1000),
		});
	}

	console.log(`R2 objects:        ${objects.length}`);
	console.log(`already in table:  ${alreadyPresent}`);
	console.log(`to insert:         ${toInsert.length}`);
	console.log(`unmatched prefix:  ${unmatched.length}`);
	if (unmatched.length > 0) {
		for (const key of unmatched.slice(0, 10)) console.log(`   skipped ${key}`);
		if (unmatched.length > 10) console.log(`   …and ${unmatched.length - 10} more`);
	}

	const perFrame = new Map<string, number>();
	for (const row of toInsert) {
		perFrame.set(row.frameId, (perFrame.get(row.frameId) ?? 0) + 1);
	}
	for (const [frameId, count] of perFrame) {
		console.log(`   frame_id ${frameId}: ${count} new rows`);
	}

	if (!commit) {
		console.log("\nDry run — nothing written. Re-run with --commit to insert.");
		return;
	}

	if (toInsert.length === 0) {
		console.log("\nNothing to insert.");
		return;
	}

	await db.batch(
		toInsert.map((row) => ({
			sql: "insert into media (title, url, user_id, frame_id, created_at, updated_at) values (?, ?, NULL, ?, ?, ?)",
			args: [row.title, row.url, row.frameId, row.timestamp, row.timestamp],
		})),
		"write",
	);

	const total = (await db.execute("select count(*) as n from media")).rows[0].n;
	console.log(`\nInserted ${toInsert.length} rows. media now has ${total} rows.`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
