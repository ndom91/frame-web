import { drizzle } from "drizzle-orm/libsql";
import { user } from "../../db/user.sql";
import { frame } from "../../db/frame.sql";
import { usersToFrames } from "../../db/frameOnUser.sql";
import { media } from "../../db/media.sql";
import { verification } from "../../db/verification.sql";
import { session } from "../../db/session.sql";
import { account } from "../../db/account.sql";
import { passkey as passkeySchema } from "../../db/passkey.sql";

export const db = drizzle({
	schema: {
		user,
		verification,
		session,
		account,
		passkey: passkeySchema,
		frame,
		usersToFrames,
		media,
	},
	connection: {
		url: process.env.TURSO_DATABASE_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN!,
	},
});
