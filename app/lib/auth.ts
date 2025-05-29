import { betterAuth } from "better-auth";
import { passkey } from "better-auth/plugins/passkey"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"
import { user } from '../../db/user.sql'
import { verification } from '../../db/verification.sql'
import { session } from '../../db/session.sql'
import { account } from '../../db/account.sql'
import { passkey as passkeySchema } from '../../db/passkey.sql'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user,
      verification,
      session,
      account,
      passkey: passkeySchema
    },
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    passkey()
  ]
});

export type Session = typeof auth.$Infer.Session
