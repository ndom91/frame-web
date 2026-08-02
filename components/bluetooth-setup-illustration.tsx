import { cn } from "@/lib/utils";

/**
 * Decorative pairing diagram: the device you're browsing on, Bluetooth arcs, and
 * the frame. Drawn with `currentColor` and theme tokens so it works in both
 * themes without a second asset. Hidden from assistive tech — the numbered steps
 * beside it carry the same information as text.
 */
export function BluetoothSetupIllustration({
	className,
}: {
	className?: string;
}) {
	return (
		<svg
			viewBox="0 0 320 140"
			role="presentation"
			aria-hidden="true"
			className={cn("h-auto w-full text-muted-foreground", className)}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			{/* Phone / browsing device */}
			<rect
				x="14"
				y="30"
				width="56"
				height="88"
				rx="9"
				className="stroke-current"
				strokeWidth="2.5"
				opacity="0.85"
			/>
			<rect
				x="22"
				y="42"
				width="40"
				height="58"
				rx="3"
				className="fill-current"
				opacity="0.09"
			/>
			<line
				x1="34"
				y1="36"
				x2="50"
				y2="36"
				className="stroke-current"
				strokeWidth="2.5"
				strokeLinecap="round"
				opacity="0.6"
			/>
			<circle cx="42" cy="108" r="3" className="fill-current" opacity="0.5" />

			{/* Bluetooth glyph, centred between the two devices */}
			<g className="text-primary">
				<circle
					cx="160"
					cy="70"
					r="21"
					className="fill-current"
					opacity="0.10"
				/>
				<path
					d="M154 60.5 L166.5 79.5 L160 84.5 L160 55.5 L166.5 60.5 L154 79.5"
					className="stroke-current"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>

			{/* Signal arcs radiating both ways */}
			<g className="stroke-current" strokeWidth="2.5" strokeLinecap="round">
				<path d="M116 58 A 18 18 0 0 0 116 82" opacity="0.5" />
				<path d="M100 50 A 30 30 0 0 0 100 90" opacity="0.3" />
				<path d="M204 58 A 18 18 0 0 1 204 82" opacity="0.5" />
				<path d="M220 50 A 30 30 0 0 1 220 90" opacity="0.3" />
			</g>

			{/* Photo frame, with a small stand */}
			<rect
				x="238"
				y="26"
				width="70"
				height="76"
				rx="7"
				className="stroke-current"
				strokeWidth="2.5"
				opacity="0.85"
			/>
			<rect
				x="247"
				y="35"
				width="52"
				height="58"
				rx="3"
				className="fill-current"
				opacity="0.09"
			/>
			{/* A tiny landscape inside the frame, so it reads as a photo */}
			<path
				d="M247 79 L263 60 L275 74 L284 66 L299 84 L299 90 A3 3 0 0 1 296 93 L250 93 A3 3 0 0 1 247 90 Z"
				className="fill-current"
				opacity="0.28"
			/>
			<circle cx="285" cy="49" r="5" className="fill-current" opacity="0.28" />
			<line
				x1="273"
				y1="102"
				x2="273"
				y2="114"
				className="stroke-current"
				strokeWidth="2.5"
				opacity="0.6"
			/>
			<line
				x1="257"
				y1="114"
				x2="289"
				y2="114"
				className="stroke-current"
				strokeWidth="2.5"
				strokeLinecap="round"
				opacity="0.6"
			/>
		</svg>
	);
}
