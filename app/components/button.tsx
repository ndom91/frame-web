'use client'

import { signIn } from "../lib/auth-client";

interface ButtonProps {
  children: React.ReactNode;
}

export default function Button({ children }: ButtonProps) {
  const signInGitHub = async () => {
    const data = await signIn.social({
      provider: "github"
    })
    console.log('DATA', data)
  }
  return (
    <button
      type="button"
      className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 hover:cursor-pointer"
      onClick={signInGitHub}
    >
      {children}
    </button>
  )
}
