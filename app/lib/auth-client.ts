import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "better-auth/client/plugins";

export const { signIn, signOut, useSession, passkey } = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
		: "http://localhost:3000",
	plugins: [passkeyClient()],
});
