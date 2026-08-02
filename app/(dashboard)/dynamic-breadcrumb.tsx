"use client";

import { Fragment } from "react";
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
import Link from "next/link";

/** "frames-list" → "Frames List" */
const toTitleCase = (segment: string) =>
	segment
		.split(/[-_]/)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

export function DynamicBreadcrumb() {
	const pathname = usePathname();

	const pathSegments = pathname
		.split("/")
		.filter((segment) => segment !== "" && segment !== "dashboard");

	const isFrameRoute = pathSegments[0]?.toLowerCase() === "frame";
	const parsedFrameId =
		isFrameRoute && pathSegments[1]
			? Number.parseInt(pathSegments[1], 10)
			: Number.NaN;
	const frameId = Number.isNaN(parsedFrameId) ? null : parsedFrameId;

	// `useFrame` is internally `enabled: !!id`, so 0 is a no-op off frame routes.
	const { data: frame } = useFrame(frameId ?? 0);

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
		if (index === 1 && isFrameRoute && frameId !== null) {
			return frame?.title ?? `Frame ${frameId}`;
		}

		return toTitleCase(segment);
	};

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{pathSegments.map((segment, index) => {
					const isLast = index === pathSegments.length - 1;
					const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
					const displayName = getSegmentDisplayName(segment, index);

					return (
						// A Fragment rather than a <div>: BreadcrumbList renders an <ol>,
						// which may only contain <li> children.
						<Fragment key={href}>
							<BreadcrumbItem>
								{isLast ? (
									<BreadcrumbPage>{displayName}</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link href={href}>{displayName}</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{!isLast && <BreadcrumbSeparator />}
						</Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
