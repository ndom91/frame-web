import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { auth, type Session } from "@/app/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DynamicBreadcrumb } from "./dynamic-breadcrumb";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	let session: Session | null = null;

	try {
		session = await auth.api.getSession({
			headers: await headers(),
		});
	} catch (e) {
		// Next signals control flow by throwing errors that carry a `digest`
		// (redirect, notFound, dynamic-rendering bailout). Those must propagate —
		// swallowing them breaks rendering and floods the build log. Only a real
		// session-fetch failure should fall through to the redirect below.
		if (e && typeof e === "object" && "digest" in e) throw e;
		console.error("Session Error", e);
	}

	// Kept outside the try: `redirect()` also signals by throwing.

	if (!session) {
		redirect("/login");
	}

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "15rem",
					"--mobile-sidebar-width": "12rem",
				} as React.CSSProperties
			}
		>
			<AppSidebar session={session} />
			{/* SidebarInset renders the <main> landmark, so this is the skip-link target. */}
			<SidebarInset id="main-content">
				<header className="flex h-16 shrink-0 items-center gap-2 px-4 pt-[env(safe-area-inset-top)]">
					<SidebarTrigger className="-ml-1" />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4"
					/>
					<DynamicBreadcrumb />
				</header>
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
