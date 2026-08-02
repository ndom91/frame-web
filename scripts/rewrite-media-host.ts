/**
 * Rewrites the hostname in every `media.url` value.
 *
 * `media.url` is not cosmetic: GET /api/media joins uploader attribution on it
 * and DELETE /api/media/[key] looks rows up by it, both matching the string
 * byte-for-byte against what `imageUrl()` generates. So moving the app to a new
 * image host without migrating these rows silently breaks attribution and
 * leaves orphaned rows behind on delete.
 *
 * Dry run by default. Pass --commit to actually write; a JSON backup of every
 * affected row is written first.
 *
 *   pnpm tsx scripts/rewrite-media-host.ts --from=images.frame.ndo.dev
 *   pnpm tsx scripts/rewrite-media-host.ts --from=images.frame.ndo.dev --commit
 */
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { createClient } from "@libsql/client";

const commit = process.argv.includes("--commit");
const fromArg = process.argv.find((arg) => arg.startsWith("--from="));

if (!fromArg) {
	console.error("Missing --from=<old-hostname>");
	process.exit(1);
}
const fromHost = fromArg.slice("--from=".length).trim();

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, NEXT_PUBLIC_IMAGE_HOSTNAME } =
	process.env;

for (const [key, value] of Object.entries({
	TURSO_DATABASE_URL,
	TURSO_AUTH_TOKEN,
	NEXT_PUBLIC_IMAGE_HOSTNAME,
})) {
	if (!value) {
		console.error(`Missing required env var: ${key}`);
		process.exit(1);
	}
}

const toHost = NEXT_PUBLIC_IMAGE_HOSTNAME!;

if (fromHost === toHost) {
	console.error(
		`--from and NEXT_PUBLIC_IMAGE_HOSTNAME are both ${toHost}; nothing to do.`,
	);
	process.exit(1);
}

const db = createClient({
	url: TURSO_DATABASE_URL!,
	authToken: TURSO_AUTH_TOKEN!,
});

async function main() {
	const rows = (await db.execute("select id, url from media")).rows.map(
		(row) => ({ id: Number(row.id), url: String(row.url) }),
	);

	const toRewrite: { id: number; from: string; to: string }[] = [];
	let alreadyTarget = 0;
	const otherHosts = new Map<string, number>();

	for (const row of rows) {
		let parsed: URL;
		try {
			parsed = new URL(row.url);
		} catch {
			otherHosts.set("<unparseable>", (otherHosts.get("<unparseable>") ?? 0) + 1);
			continue;
		}

		if (parsed.hostname === toHost) {
			alreadyTarget++;
			continue;
		}
		if (parsed.hostname !== fromHost) {
			otherHosts.set(parsed.hostname, (otherHosts.get(parsed.hostname) ?? 0) + 1);
			continue;
		}

		parsed.hostname = toHost;
		toRewrite.push({ id: row.id, from: row.url, to: parsed.toString() });
	}

	// Two rows landing on the same url would make the uploader join ambiguous.
	const targets = new Set(toRewrite.map((row) => row.to));
	const existing = new Set(
		rows.map((row) => row.url).filter((url) => url.includes(toHost)),
	);
	const collisions = [...targets].filter((url) => existing.has(url));

	console.log(`media rows:        ${rows.length}`);
	console.log(`already on ${toHost}: ${alreadyTarget}`);
	console.log(`to rewrite:        ${toRewrite.length}`);
	for (const [host, count] of otherHosts) {
		console.log(`   left alone (${host}): ${count}`);
	}
	if (toRewrite.length > 0) {
		console.log("\nsample:");
		for (const row of toRewrite.slice(0, 3)) {
			console.log(`   ${row.from}\n → ${row.to}`);
		}
	}

	if (collisions.length > 0) {
		console.error(
			`\nAborting: ${collisions.length} rewritten url(s) already exist on ${toHost}.`,
		);
		for (const url of collisions.slice(0, 5)) console.error(`   ${url}`);
		process.exit(1);
	}

	if (!commit) {
		console.log("\nDry run — nothing written. Re-run with --commit to update.");
		return;
	}

	if (toRewrite.length === 0) {
		console.log("\nNothing to rewrite.");
		return;
	}

	const backupPath = `media-url-backup-${Date.now()}.json`;
	writeFileSync(backupPath, JSON.stringify(toRewrite, null, 2));
	console.log(`\nBacked up ${toRewrite.length} rows to ${backupPath}`);

	await db.batch(
		toRewrite.map((row) => ({
			sql: "update media set url = ? where id = ?",
			args: [row.to, row.id],
		})),
		"write",
	);

	const remaining = (
		await db.execute({
			sql: "select count(*) as n from media where url like ?",
			args: [`https://${fromHost}/%`],
		})
	).rows[0].n;
	console.log(
		`Rewrote ${toRewrite.length} rows. Rows still on ${fromHost}: ${remaining}.`,
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
