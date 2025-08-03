import { Metadata } from "next";
import Frame from "@/app/(dashboard)/frame/[id]/frame";
import { db } from "@/app/lib/db";

export const metadata: Metadata = {
	title: "Domino Frame - Frames",
};

export default async function Page({
	params,
}: {
	params: Promise<{ id: number }>;
}) {
	const { id } = await params;
	const frame = await db.query.frame.findFirst({
		where: (frame, { eq }) => eq(frame.id, id),
	});

	if (!frame) return <div>Frame not found</div>;

	return (
		<div>
			<Frame frame={frame} />
		</div>
	);
}
