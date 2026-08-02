import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { frame } from "./frame.sql";
import { user } from "./user.sql";

export const media = sqliteTable("media", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  url: text().notNull(),
  // Nullable: photos backfilled from R2 predate the media table and have no
  // known uploader. SET NULL rather than cascade so a photo record outlives the
  // account that uploaded it, instead of silently disappearing from the counts.
  createdBy: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  frameId: text('frame_id').notNull().references(() => frame.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});
