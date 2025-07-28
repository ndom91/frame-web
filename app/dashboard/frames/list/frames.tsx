"use client";

import { useState } from "react";
import Frame, { type Frame as FrameConfig } from "./frame";

export default function Frames() {
	const [frames, setFrames] = useState<FrameConfig[]>([]);

	return (
		<div>
			<ul>
				{frames.map((frame) => (
					<Frame />
				))}
			</ul>
		</div>
	);
}
