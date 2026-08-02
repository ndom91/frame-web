import { WifiHighIcon } from "@phosphor-icons/react/dist/ssr/WifiHigh";
import { WifiSlashIcon } from "@phosphor-icons/react/dist/ssr/WifiSlash";
import { PulseIcon } from "@phosphor-icons/react/dist/ssr/Pulse";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FrameStatus = "online" | "offline" | "syncing";

/**
 * Every variant carries a `dark:` counterpart. The previous copies of this
 * helper (one in the frames list, one on the frame detail page, with differing
 * shades) hardcoded light-only colours, so badges were unreadable once the
 * theme toggle switched to dark.
 */
const BADGE_VARIANTS: Record<FrameStatus, string> = {
	online:
		"bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-950 dark:text-lime-200 dark:border-lime-900",
	offline:
		"bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-900",
	syncing:
		"bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-900",
};

const STATUS_LABELS: Record<FrameStatus, string> = {
	online: "Online",
	offline: "Offline",
	syncing: "Syncing",
};

function isFrameStatus(status: string | null): status is FrameStatus {
	return status !== null && status in BADGE_VARIANTS;
}

export function FrameStatusBadge({
	status,
	className,
}: {
	status: string | null;
	className?: string;
}) {
	if (!isFrameStatus(status)) return null;

	return (
		<Badge variant="outline" className={cn(BADGE_VARIANTS[status], className)}>
			{STATUS_LABELS[status]}
		</Badge>
	);
}

/**
 * Decorative — the adjacent `FrameStatusBadge` already names the status in
 * text, so this is hidden from assistive tech rather than duplicated.
 */
export function FrameStatusIcon({
	status,
	className,
}: {
	status: string | null;
	className?: string;
}) {
	const iconClassName = cn("size-5 shrink-0", className);

	switch (status) {
		case "online":
			return (
				<WifiHighIcon
					aria-hidden="true"
					className={cn(iconClassName, "text-lime-600 dark:text-lime-400")}
				/>
			);
		case "syncing":
			return (
				<PulseIcon
					aria-hidden="true"
					className={cn(
						iconClassName,
						"animate-pulse text-sky-600 dark:text-sky-400",
					)}
				/>
			);
		case "offline":
			return (
				<WifiSlashIcon
					aria-hidden="true"
					className={cn(iconClassName, "text-rose-600 dark:text-rose-400")}
				/>
			);
		default:
			return null;
	}
}
