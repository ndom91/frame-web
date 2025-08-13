import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardPage from "./dashboardPage";

export default async function Dashboard() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) redirect("/login");

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			<DashboardPage />
		</div>
	);
}
