import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
