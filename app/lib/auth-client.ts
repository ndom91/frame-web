import { createAuthClient } from "better-auth/react"
import { passkeyClient } from "better-auth/client/plugins"

export const { signIn, signOut, useSession } = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    passkeyClient()
  ]
})
