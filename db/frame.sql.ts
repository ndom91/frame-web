import { relations } from "drizzle-orm";
import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usersToFrames } from "./frameOnUser.sql";

export const frame = sqliteTable("frame", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const usersRelations = relations(frame, ({ many }) => ({
  usersToFrames: many(usersToFrames)
}));
