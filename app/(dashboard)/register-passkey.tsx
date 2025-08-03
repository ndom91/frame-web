'use client'

import { passkey } from "@/app/lib/auth-client"
import { useEffect } from "react";

export default function RegisterPasskey() {
  useEffect(() => {
    if (!document) return

    const pathnameParams = new URLSearchParams(new URL(document.URL).search)
    async function registerPasskey() {
      if (pathnameParams.get("new-user") === "true") {
        const { data, error } = await passkey.addPasskey();
        console.log('PASSKEY', { data, error })
      }
    }
    registerPasskey()
  }, [])

  return <p>Current pathname</p>
}
