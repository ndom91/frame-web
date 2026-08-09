"use client";

import { useCallback, useId, useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	Monitor,
	MapPin,
	Upload,
	MoreHorizontal,
	Trash2,
	ImageIcon,
	FileWarning,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import ImageCard from "./imageCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FrameStatusBadge, FrameStatusIcon } from "@/components/frame-status";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { VirtualizedMasonryGrid } from "@/components/virtualized-masonry-grid";
import type { Frame } from "@/lib/types";
import { formatDateTime, formatFileSize } from "@/lib/utils";
import { useLocale, useTimeZone } from "@/app/lib/use-locale";
import { useMedia, useUploadMedia } from "@/app/lib/queries/media";
import { useDeleteFrame, useFrame } from "@/app/lib/queries/frames";

interface Props {
	frame: Frame;
}

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;


function EmptyState({
	uploadInputId,
	onFilesSelected,
}: {
	uploadInputId: string;
	onFilesSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<div className="flex flex-col items-center justify-center px-4 py-16">
			<div className="relative mb-6">
				<div
					aria-hidden="true"
					className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-300 to-purple-400"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-blue-700/50 to-purple-700/50" />
					<div className="relative">
						<ImageIcon className="mb-2 h-12 w-12 text-blue-100" />
						<div className="flex justify-center gap-1">
							<div className="h-2 w-2 animate-bounce rounded-full bg-blue-300 [animation-delay:-0.3s]" />
							<div className="h-2 w-2 animate-bounce rounded-full bg-purple-300 [animation-delay:-0.15s]" />
							<div className="h-2 w-2 animate-bounce rounded-full bg-blue-300" />
						</div>
					</div>
				</div>
			</div>
			<h3 className="mb-2 text-xl font-semibold text-muted-foreground">
				No media uploaded yet
			</h3>
			<p className="mb-6 max-w-sm text-center text-muted-foreground">
				Upload your first images to start displaying beautiful memories on your
				digital frame.
			</p>
			<input
				id={uploadInputId}
				type="file"
				multiple
				accept="image/*"
				onChange={onFilesSelected}
				className="sr-only"
			/>
			<Button asChild variant="default" size="lg">
				<label htmlFor={uploadInputId} className="cursor-pointer">
					<Upload aria-hidden="true" className="mr-2 h-4 w-4" />
					Upload Images
				</label>
			</Button>
		</div>
	);
}

export default function FramePage({ frame: initialFrame }: Props) {
	const router = useRouter();
	const locale = useLocale();
	const timeZone = useTimeZone();
	const { data: frame = initialFrame } = useFrame(initialFrame.id, {
		refetchInterval: 10_000,
	});
	const [isDragging, setIsDragging] = useState(false);
	const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

	// Distinct ids: both upload inputs previously used id="file-upload", so the
	// second label pointed at the first (hidden) input and did nothing.
	const headerUploadId = useId();
	const emptyStateUploadId = useId();

	const {
		data: mediaFiles = [],
		isLoading: isLoadingMedia,
		error: mediaError,
	} = useMedia(frame.frameId);

	const { mutateAsync, isPending, isError } = useUploadMedia();
	const deleteFrame = useDeleteFrame();

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (e.currentTarget === e.target) {
			setIsDragging(false);
		}
	}, []);

	const handleFileUpload = async (files: File[]) => {
		try {
			const validFiles: File[] = [];
			const invalidFiles: string[] = [];

			files.forEach((file) => {
				if (!file.type.startsWith("image/")) {
					invalidFiles.push(`${file.name} (not an image)`);
					return;
				}

				if (file.size > MAX_UPLOAD_BYTES) {
					invalidFiles.push(
						`${file.name} (${formatFileSize(file.size, locale)} — over the ${formatFileSize(MAX_UPLOAD_BYTES, locale)} limit)`,
					);
					return;
				}

				validFiles.push(file);
			});

			if (invalidFiles.length > 0) {
				toast.error(
					`Skipped ${invalidFiles.length} ${invalidFiles.length === 1 ? "file" : "files"}`,
					{ description: invalidFiles.join(", ") },
				);
			}

			if (validFiles.length === 0) return;

			const results = await Promise.allSettled(
				validFiles.map((file) =>
					mutateAsync({ file, key: `${frame.frameId}/${file.name}` }),
				),
			);

			const successful = results.filter(
				(result) => result.status === "fulfilled",
			);
			const failed = results.filter((result) => result.status === "rejected");

			if (successful.length > 0) {
				toast.success(
					`Uploaded ${successful.length} ${successful.length === 1 ? "image" : "images"}`,
				);
			}

			if (failed.length > 0) {
				toast.error(
					`Failed to upload ${failed.length} ${failed.length === 1 ? "file" : "files"}`,
					{
						description: failed
							.map((result) => result.reason?.message || "Unknown error")
							.join(", "),
					},
				);
			}
		} catch (error) {
			console.error("Upload failed:", error);
			toast.error("Failed to upload files", {
				description: "Check your connection and try again.",
			});
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const imageFiles = Array.from(e.dataTransfer.files).filter((file) =>
			file.type.startsWith("image/"),
		);

		if (imageFiles.length === 0) {
			toast.error("No images found", {
				description: "Drop JPEG, PNG, or WebP files to upload them.",
			});
			return;
		}

		handleFileUpload(imageFiles);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const imageFiles = Array.from(e.target.files || []).filter((file) =>
			file.type.startsWith("image/"),
		);

		if (imageFiles.length > 0) {
			handleFileUpload(imageFiles);
		}

		e.target.value = "";
	};

	const handleRemoveFrame = async () => {
		try {
			await deleteFrame.mutateAsync(frame.id);
			toast.success(`Removed ${frame.title}`);
			router.push("/frames/list");
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

	const storageUsedBytes =
		frame.storageTotalBytes === null || frame.storageAvailableBytes === null
			? null
			: frame.storageTotalBytes - frame.storageAvailableBytes;
	const storagePercent =
		storageUsedBytes === null || !frame.storageTotalBytes
			? 0
			: Math.round((storageUsedBytes / frame.storageTotalBytes) * 100);

	// Copy before sorting — the array is react-query's cached value, and sorting
	// in place mutated the cache during render.
	const sortedMedia = [...mediaFiles].sort((a, b) =>
		a.lastmodified > b.lastmodified ? -1 : 1,
	);

	return (
		<div
			className="container mx-auto space-y-4 p-3 pt-0! md:space-y-6 md:p-6"
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{isDragging && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
					<div className="mx-4 max-w-md rounded-lg border-2 border-dashed border-primary bg-card p-12 text-center">
						<Upload
							aria-hidden="true"
							className="mx-auto mb-4 h-12 w-12 text-primary"
						/>
						<h3 className="mb-2 text-lg font-semibold">
							Drop your images here
						</h3>
						<p className="text-muted-foreground text-sm">
							Release to upload your image files
						</p>
					</div>
				</div>
			)}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/frames/list">
						<ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />
						Back to Frames
					</Link>
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<Card className="h-full">
						<CardContent>
							<div className="flex items-start justify-between">
								<div className="space-y-2">
									<div className="flex flex-wrap items-center gap-3 pr-4">
										<h1 className="text-3xl font-bold">{frame.title}</h1>
										<FrameStatusIcon status={frame.status} />
										<FrameStatusBadge status={frame.status} />
									</div>
									<div className="flex flex-col items-start gap-1 text-muted-foreground md:flex-row md:items-center md:gap-4">
										<span className="flex items-center gap-2">
											<Monitor aria-hidden="true" className="size-4" />
											{frame.model || "Unknown model"}
										</span>
										<span className="flex items-center gap-2">
											<MapPin aria-hidden="true" className="size-4" />
											{frame.location || "No location"}
										</span>
									</div>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											aria-label={`Actions for ${frame.title}`}
										>
											<MoreHorizontal aria-hidden="true" className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
								<DropdownMenuSeparator />
										<DropdownMenuItem
											variant="destructive"
											onSelect={(event) => {
												event.preventDefault();
												setConfirmRemoveOpen(true);
											}}
										>
											<Trash2 aria-hidden="true" className="mr-2 h-4 w-4" />
											Remove Frame
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardContent>
					</Card>
				</div>

				<div>
					<Card className="gap-2 md:gap-4">
						<CardHeader>
							<CardTitle className="text-lg">System Status</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">
									Last seen
									</span>
									<span className="text-sm font-medium tabular-nums">
									{frame.lastSeenAt
										? formatDateTime(frame.lastSeenAt, locale, timeZone)
										: "Never"}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Uptime</span>
									<span className="text-sm font-medium tabular-nums">
										{frame.uptimeSeconds === null
											? "Not reported"
											: `${Math.floor(frame.uptimeSeconds / 3600)}h ${Math.floor((frame.uptimeSeconds % 3600) / 60)}m`}
									</span>
								</div>
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Storage</span>
									<span className="text-sm font-medium tabular-nums">
									{storageUsedBytes === null || frame.storageTotalBytes === null
										? "Not reported"
										: `${formatFileSize(storageUsedBytes, locale)} / ${formatFileSize(frame.storageTotalBytes, locale)}`}
								</span>
							</div>
							{storageUsedBytes !== null && <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${storagePercent}%` }} /></div>}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Separator />

			<div className="space-y-4 px-4 md:space-y-6">
				<div className="flex items-start justify-between">
					<h2 className="text-2xl font-bold">Media</h2>
					<div className="flex flex-col gap-2">
						<div className="flex gap-2">
							<Badge variant="secondary" className="text-sm tabular-nums">
								{mediaFiles.length}{" "}
								{mediaFiles.length === 1 ? "file" : "files"}
							</Badge>
							<input
								id={headerUploadId}
								type="file"
								multiple
								accept="image/*"
								onChange={handleFileInputChange}
								className="sr-only"
							/>
							<Button asChild variant="default" size="lg">
								<label htmlFor={headerUploadId} className="cursor-pointer">
									<Upload aria-hidden="true" className="mr-2 h-4 w-4" />
									Upload Images
								</label>
							</Button>
						</div>
						<div aria-live="polite" className="min-h-0">
							{isPending && (
								<div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
									<div
										aria-hidden="true"
										className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
									/>
									Uploading…
								</div>
							)}
							{isError && (
								<div className="flex items-center justify-end gap-2 text-sm text-destructive">
									<FileWarning aria-hidden="true" className="size-4" />
									Upload failed — try again
								</div>
							)}
						</div>
					</div>
				</div>

				{isLoadingMedia ? (
					<div role="status" aria-live="polite" className="py-12 text-center">
						<div
							aria-hidden="true"
							className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
						/>
						<p className="text-muted-foreground">Loading media files…</p>
					</div>
				) : mediaError ? (
					<div role="alert" className="py-12 text-center">
						<p className="mb-2 text-destructive">
							Couldn&rsquo;t load media files
						</p>
						<p className="text-muted-foreground text-sm">
							{mediaError.message}
						</p>
					</div>
				) : sortedMedia.length > 0 ? (
					<VirtualizedMasonryGrid
						items={sortedMedia}
						getKey={(item) => item.key}
						renderItem={(item) => <ImageCard item={item} isActive={item.name === frame.activeImage} />}
					/>
				) : (
					<EmptyState
						uploadInputId={emptyStateUploadId}
						onFilesSelected={handleFileInputChange}
					/>
				)}
			</div>

			<ConfirmDialog
				open={confirmRemoveOpen}
				onOpenChange={setConfirmRemoveOpen}
				title={`Remove ${frame.title}?`}
				description="This removes the frame from your account and returns you to the frames list. Images already uploaded to it are not deleted."
				confirmLabel="Remove Frame"
				pending={deleteFrame.isPending}
				onConfirm={handleRemoveFrame}
			/>
		</div>
	);
}
