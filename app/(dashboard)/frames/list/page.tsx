import { Metadata } from "next";
import Frames from "@/app/(dashboard)/frames/list/frames";
import { db } from "@/app/lib/db";

export const metadata: Metadata = {
	title: "Domino Frame - Frames",
};

export default async function Page() {
	const frames = await db.query.frame.findMany();

	return (
		<div>
			<Frames frames={frames} />
		</div>
	);
}
