import { Metadata } from "next";
import Frames from "@/app/(dashboard)/frames/list/frames";

export const metadata: Metadata = {
	title: "Domino Frame - Frames",
};

export default function Page() {
	return (
		<div>
			<Frames />
		</div>
	);
}
