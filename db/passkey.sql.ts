import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./user.sql";

export const passkey = sqliteTable("passkey", {
	id: text('id').primaryKey(),
	name: text('name'),
	publicKey: text('public_key').notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	credentialID: text('credential_i_d').notNull(),
	counter: integer('counter').notNull(),
	deviceType: text('device_type').notNull(),
	backedUp: integer('backed_up', { mode: 'boolean' }).notNull(),
	transports: text('transports'),
	createdAt: integer('created_at', { mode: 'timestamp' })
});
