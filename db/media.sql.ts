import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { frame } from "./frame.sql";
import { user } from "./user.sql";

export const media = sqliteTable("media", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  url: text().notNull(),
  createdBy: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  frameId: text('frame_id').notNull().references(() => frame.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});
