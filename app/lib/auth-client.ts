import { createAuthClient } from "better-auth/react"
import { passkeyClient } from "better-auth/client/plugins"

export const { signIn, signOut, useSession, passkey } = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    passkeyClient()
  ]
})
