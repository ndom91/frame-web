import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./user.sql";
import { frame } from "./frame.sql";

export const usersToFrames = sqliteTable(
  'users_to_frames',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => user.id),
    frameId: integer('frame_id')
      .notNull()
      .references(() => frame.id),
    role: text({ enum: ["ADMIN", "WRITE", "READ"] }).default('READ').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.frameId] })
  ],
);

export const usersToFramesRelations = relations(usersToFrames, ({ one }) => ({
  frame: one(frame, {
    fields: [usersToFrames.frameId],
    references: [frame.id],
  }),
  user: one(user, {
    fields: [usersToFrames.userId],
    references: [user.id],
  }),
}));
