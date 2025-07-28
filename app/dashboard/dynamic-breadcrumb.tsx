"use client";

import { usePathname } from "next/navigation";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function DynamicBreadcrumb() {
	const pathname = usePathname();

	const pathSegments = pathname
		.split("/")
		.filter((segment) => segment !== "" && segment !== "dashboard");

	const capitalize = (str: string) =>
		str.charAt(0).toUpperCase() + str.slice(1);

	if (pathSegments.length === 0) {
		return (
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>Dashboard</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		);
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{pathSegments.map((segment, index) => {
					const isLast = index === pathSegments.length - 1;
					const href = `/dashboard/${pathSegments.slice(0, index + 1).join("/")}`;

					return (
						<div key={segment} className="flex items-center">
							<BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
								{isLast ? (
									<BreadcrumbPage>{capitalize(segment)}</BreadcrumbPage>
								) : (
									<BreadcrumbLink href={href}>
										{capitalize(segment)}
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{!isLast && (
								<BreadcrumbSeparator className="ml-2 hidden md:block" />
							)}
						</div>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}

