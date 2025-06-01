'use client'

import { signIn } from "@/app/lib/auth-client";
import { useEffect } from "react";

export default function PasskeyConditionalUI() {
  useEffect(() => {
    if (!PublicKeyCredential.isConditionalMediationAvailable ||
      !PublicKeyCredential.isConditionalMediationAvailable()) {
      return;
    }

    void signIn.passkey({ autoFill: true })
  }, [])

  return null
}

