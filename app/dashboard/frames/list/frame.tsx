"use client";

export type Frame = {
	id: string;
	name: string;
	createdAt: string;
};

interface Props {
	frame: Frame;
}

export default function Frame({ frame }: Props) {
	console.log("FRAME", frame);
	return <div></div>;
}
