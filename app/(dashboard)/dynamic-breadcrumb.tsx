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
import { useFrame } from "@/app/lib/queries/frames";

export function DynamicBreadcrumb() {
	const pathname = usePathname();

	const pathSegments = pathname
		.split("/")
		.filter((segment) => segment !== "" && segment !== "dashboard");

	const capitalize = (str: string) =>
		str.charAt(0).toUpperCase() + str.slice(1);

	const isFrameRoute = pathSegments[0]?.toLowerCase() === "frame";
	const frameId =
		isFrameRoute && pathSegments[1] ? parseInt(pathSegments[1], 10) : null;

	const { data: frame } = useFrame(frameId || 0);

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

	const getSegmentDisplayName = (segment: string, index: number) => {
		if (index === 1 && isFrameRoute && frameId) {
			if (frame) {
				return frame.title;
			}

			return `Frame ${frameId}`;
		}

		return capitalize(segment);
	};

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{pathSegments.map((segment, index) => {
					const isLast = index === pathSegments.length - 1;
					const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
					const displayName = getSegmentDisplayName(segment, index);

					return (
						<div key={`${segment}-${index}`} className="flex items-center">
							<BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
								{isLast ? (
									<BreadcrumbPage>{displayName}</BreadcrumbPage>
								) : (
									<BreadcrumbLink href={href}>{displayName}</BreadcrumbLink>
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
