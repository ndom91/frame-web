import CardSkeleton from "@/components/card-skeleton";

export default function Loading() {
	return (
		<div className="m-4 flex flex-wrap gap-4">
			<CardSkeleton />
			<CardSkeleton />
			<CardSkeleton />
		</div>
	);
}
