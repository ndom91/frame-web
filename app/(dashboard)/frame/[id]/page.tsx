import { Metadata } from "next";
import { notFound } from "next/navigation";
import Frame from "@/app/(dashboard)/frame/[id]/frame";
import { db } from "@/app/lib/db";

// Route params are always strings, even for a numeric segment.
type PageProps = { params: Promise<{ id: string }> };

function parseFrameId(id: string) {
	const parsed = Number.parseInt(id, 10);
	return Number.isNaN(parsed) ? null : parsed;
}

async function getFrame(id: string) {
	const frameId = parseFrameId(id);
	if (frameId === null) return undefined;

	return db.query.frame.findFirst({
		where: (frame, { eq }) => eq(frame.id, frameId),
	});
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { id } = await params;
	const frame = await getFrame(id);

	return {
		title: frame ? `${frame.title} — Domino Frame` : "Domino Frame",
	};
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const frame = await getFrame(id);

	if (!frame) notFound();

	return (
		<div>
			<Frame frame={frame} />
		</div>
	);
}
