import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonCard() {
	return (
		<div
			role="status"
			aria-label="Loading…"
			className="flex w-full max-w-sm flex-col space-y-3"
		>
			<Skeleton className="h-[125px] w-full rounded-xl" />
			<div className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-4/5" />
			</div>
		</div>
	);
}
