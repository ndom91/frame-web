"use client";

import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/ssr/DotsThree";
import { AirplayIcon } from "@phosphor-icons/react/dist/ssr/Airplay";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowsClockwise";
import { MapPinIcon } from "@phosphor-icons/react/dist/ssr/MapPin";
import { ClockIcon } from "@phosphor-icons/react/dist/ssr/Clock";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FrameStatusBadge, FrameStatusIcon } from "@/components/frame-status";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Frame } from "@/lib/types";
import { useMedia } from "@/app/lib/queries/media";
import { useDeleteFrame } from "@/app/lib/queries/frames";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/app/lib/use-locale";

interface Props {
	frame: Frame;
	selectedFrames?: number[];
	setSelectedFrames?: Dispatch<SetStateAction<number[]>>;
}

const PLACEHOLDER_IMAGE = "https://unsplash.it/300/200";

export default function Frame({
	frame,
	selectedFrames,
	setSelectedFrames,
}: Props) {
	const router = useRouter();
	const locale = useLocale();
	const checkboxId = useId();
	const { data: mediaFiles = [] } = useMedia(frame.frameId);
	const deleteFrame = useDeleteFrame();
	const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

	const handleSelectFrame = (frameId: number) => {
		if (!setSelectedFrames) return;
		setSelectedFrames((prev) =>
			prev.includes(frameId)
				? prev.filter((id) => id !== frameId)
				: [...prev, frameId],
		);
	};

	const handleRemove = async () => {
		try {
			await deleteFrame.mutateAsync(frame.id);
			toast.success(`Removed ${frame.title}`);
		} catch (error) {
			console.error("Failed to remove frame", error);
			toast.error("Couldn't remove frame", {
				description:
					error instanceof Error
						? error.message
						: "Check your connection and try again.",
			});
		}
	};

	// Deterministic rather than random: Math.random() during render picked a
	// different image on the server than on the client, which desynced hydration.
	const previewImage =
		mediaFiles.length > 0
			? mediaFiles[frame.id % mediaFiles.length]?.url
			: undefined;

	return (
		<Card className="gap-0 overflow-hidden py-4">
			<CardHeader className="px-4">
				<div className="flex justify-between">
					<div className="flex min-w-0 gap-2">
						{setSelectedFrames && (
							<Checkbox
								id={checkboxId}
								checked={selectedFrames?.includes(frame.id)}
								onCheckedChange={() => handleSelectFrame(frame.id)}
								className="mt-1"
							/>
						)}
						<div className="min-w-0">
							{/* The title doubles as the checkbox's hit target, so there's no
							    dead zone beside the control. */}
							<h3 className="truncate font-medium">
								{setSelectedFrames ? (
									<label htmlFor={checkboxId} className="cursor-pointer">
										{frame.title}
									</label>
								) : (
									frame.title
								)}
							</h3>
						</div>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								aria-label={`Actions for ${frame.title}`}
							>
								<DotsThreeIcon aria-hidden="true" className="size-6" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => router.push(`/frame/${frame.id}`)}
							>
								View Details
							</DropdownMenuItem>
							<DropdownMenuItem disabled>
								Sync Now
								<span className="text-muted-foreground ml-auto text-xs">
									Soon
								</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								variant="destructive"
								onSelect={(event) => {
									// Let the menu close before the dialog takes focus.
									event.preventDefault();
									setConfirmRemoveOpen(true);
								}}
							>
								Remove Frame
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent className="flex h-full flex-col space-y-3 px-4">
				<div className="relative flex-1 overflow-hidden rounded-lg bg-muted">
					<Image
						src={previewImage || PLACEHOLDER_IMAGE}
						width={300}
						height={200}
						alt={
							previewImage
								? `Currently displayed on ${frame.title}`
								: `${frame.title} has no images yet`
						}
						className="relative! h-56 w-full object-cover object-center"
					/>
					<div className="absolute top-2 right-2 rounded-md bg-background/90 p-1">
						<FrameStatusIcon status={frame.status} />
					</div>
				</div>

				<div>
					<div className="flex items-center justify-between gap-2">
						<div className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
							<MapPinIcon aria-hidden="true" className="size-4 shrink-0" />
							<span className="truncate">
								{frame.location || "No location"}
							</span>
						</div>
						<FrameStatusBadge status={frame.status} />
					</div>

					{frame.status !== "offline" && frame.updatedAt && (
						<div className="flex items-center gap-1 text-sm text-muted-foreground">
							<ClockIcon aria-hidden="true" className="size-4 shrink-0" />
							Up since: {formatDate(frame.updatedAt, locale)}
						</div>
					)}
				</div>

				<div className="flex gap-2">
					<Button variant="outline" size="sm" className="flex-1" disabled>
						<ArrowsClockwiseIcon aria-hidden="true" className="size-4" />
						Sync Now
					</Button>
					<Button variant="default" size="sm" className="flex-1" asChild>
						<Link href={`/frame/${frame.id}`}>
							<AirplayIcon aria-hidden="true" className="size-4" />
							Manage
						</Link>
					</Button>
				</div>
			</CardContent>

			<ConfirmDialog
				open={confirmRemoveOpen}
				onOpenChange={setConfirmRemoveOpen}
				title={`Remove ${frame.title}?`}
				description="This removes the frame from your account. Images already uploaded to it are not deleted."
				confirmLabel="Remove Frame"
				pending={deleteFrame.isPending}
				onConfirm={handleRemove}
			/>
		</Card>
	);
}
