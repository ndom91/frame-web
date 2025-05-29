'use client'

import { usePathname } from 'next/navigation'

export default function RegisterPasskey() {
  const pathname = usePathname()
  return <p>Current pathname: {pathname}</p>
}
