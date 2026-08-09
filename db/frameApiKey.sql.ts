import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { frame } from "./frame.sql";

export const frameApiKey = sqliteTable(
	"frame_api_key",
	{
		id: integer().primaryKey({ autoIncrement: true }),
		frameId: integer("frame_id")
			.notNull()
			.references(() => frame.id, { onDelete: "cascade" }),
		keyHash: text("key_hash").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.$defaultFn(() => new Date())
			.notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
		activatedAt: integer("activated_at", { mode: "timestamp" }),
	},
	(table) => [
		uniqueIndex("frame_api_key_hash_idx").on(table.keyHash),
		uniqueIndex("frame_api_key_pending_frame_id_idx")
			.on(table.frameId)
			.where(sql`${table.activatedAt} is null`),
	],
);
