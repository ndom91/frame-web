import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { usersToFrames } from "./frameOnUser.sql";
import { relations } from "drizzle-orm";

export const user = sqliteTable("user", {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).$defaultFn(() => false).notNull(),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const usersRelations = relations(user, ({ many }) => ({
	usersToFrames: many(usersToFrames),
}));

