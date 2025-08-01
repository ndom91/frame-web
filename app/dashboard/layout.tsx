import { AppSidebar } from "@/components/app-sidebar";
// import {
// 	Breadcrumb,
// 	BreadcrumbItem,
// 	BreadcrumbLink,
// 	BreadcrumbList,
// 	BreadcrumbPage,
// 	BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
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
	let session: Session | Record<string, unknown> | null = {};

	try {
		session = await auth.api.getSession({
			headers: await headers(),
		});
	} catch (e) {
		console.error("Session Error", e);
		if (e) redirect("/login");
	}

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
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 px-4">
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
