import { relations } from "drizzle-orm";
import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usersToFrames } from "./frameOnUser.sql";

export const frame = sqliteTable("frame", {
	id: int().primaryKey({ autoIncrement: true }),
	title: text().notNull(),
	frameId: text().notNull().unique(),
	location: text().notNull(),
	model: text().notNull(),
	status: text().$type<"online" | "offline" | "syncing">().default("offline"),
	lastSeenAt: integer("last_seen_at", { mode: "timestamp" }),
	uptimeSeconds: integer("uptime_seconds"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
});

export const usersRelations = relations(frame, ({ many }) => ({
	usersToFrames: many(usersToFrames),
}));
