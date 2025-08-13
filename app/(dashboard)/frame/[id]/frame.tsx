"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	Wifi,
	WifiOff,
	Monitor,
	MapPin,
	Upload,
	MoreHorizontal,
	RotateCcw,
	Trash2,
	ImageIcon,
	FileWarning,
} from "lucide-react";

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
import { Progress } from "@/components/ui/progress";
import type { Frame } from "@/lib/types";
import { getRelativeTime } from "@/lib/utils";
import { useMedia, useUploadMedia } from "@/app/lib/queries/media";
import { toast } from "sonner";

interface Props {
	frame: Frame;
}

export const getStatusBadge = (status: string | null) => {
	if (!status) return;

	const variants = {
		online: "bg-lime-100 text-lime-800 border-lime-200",
		offline: "bg-rose-100 text-rose-800 border-rose-200",
		syncing: "bg-sky-100 text-sky-800 border-sky-200",
	};

	return (
		<Badge
			variant="outline"
			className={variants[status as keyof typeof variants]}
		>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</Badge>
	);
};

export default function FramePage({ frame }: Props) {
	const router = useRouter();
	const [isDragging, setIsDragging] = useState(false);

	const {
		data: mediaFiles = [],
		isLoading: isLoadingMedia,
		error: mediaError,
	} = useMedia(frame.frameId);

	const { mutateAsync, isPending, isError } = useUploadMedia();

	const getStatusIcon = (status: string | null) => {
		if (!status) return;

		switch (status) {
			case "online":
				return <Wifi className="flex-shrink-0 h-5 w-5 text-lime-500" />;
			case "offline":
				return <WifiOff className="flex-shrink-0 h-5 w-5 text-rose-500" />;
			case "syncing":
				return (
					<Monitor className="flex-shrink-0 h-5 w-5 text-sky-500 animate-pulse" />
				);
			default:
				return <WifiOff className="flex-shrink-0 h-5 w-5 text-gray-400" />;
		}
	};

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

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const droppedFiles = Array.from(e.dataTransfer.files);
		const imageFiles = droppedFiles.filter((file) =>
			file.type.startsWith("image/"),
		);

		if (imageFiles.length === 0) {
			console.log("No valid image files found");
			return;
		}

		handleFileUpload(imageFiles);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || []);
		const imageFiles = selectedFiles.filter((file) =>
			file.type.startsWith("image/"),
		);

		console.log("upload.imageFiles", imageFiles);

		if (imageFiles.length > 0) {
			handleFileUpload(imageFiles);
		}

		e.target.value = "";
	};

	const handleFileUpload = async (files: File[]) => {
		try {
			const uploadPromises = files.map((file) => {
				const key = `${frame.frameId}/${file.name}`;
				return mutateAsync({ file, key });
			});

			const results = await Promise.allSettled(uploadPromises);

			const successful = results.filter(
				(result) => result.status === "fulfilled",
			);
			const failed = results.filter((result) => result.status === "rejected");

			if (successful.length > 0) {
				successful.map((successfulUpload) => {
					toast.error(`Successfully to upload ${successfulUpload.value.name}`);
				});
			}

			if (failed.length > 0) {
				failed.map(() => {
					toast.error(
						`Failed to upload ${failed.length} ${failed.length > 1 ? "files" : "file"}`,
					);
				});
			}
		} catch (error) {
			console.error("Upload failed:", error);
			toast.error("Failed to upload files. Please try again.");
		}
	};

	const EmptyState = () => (
		<div className="flex flex-col items-center justify-center py-16 px-4">
			<div className="relative mb-6">
				<div className="w-32 h-32 bg-gradient-to-br from-blue-300 to-purple-400 rounded-2xl flex items-center justify-center relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-blue-700/50 to-purple-700/50"></div>
					<div className="relative">
						<ImageIcon className="h-12 w-12 text-blue-400 mb-2" />
						<div className="flex gap-1 justify-center">
							<div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
							<div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
							<div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
						</div>
					</div>
					<div className="absolute top-2 right-2 w-4 h-4 bg-white/30 rounded-full"></div>
					<div className="absolute bottom-3 left-3 w-3 h-3 bg-white/20 rounded-full"></div>
					<div className="absolute top-1/2 left-2 w-2 h-2 bg-white/25 rounded-full"></div>
				</div>
			</div>
			<h3 className="text-xl font-semibold text-muted-foreground mb-2">
				No media uploaded yet
			</h3>
			<p className="text-gray-500 text-center mb-6 max-w-sm">
				Upload your first images to start displaying beautiful memories on your
				digital frame.
			</p>
			<div className="flex gap-3">
				<div className="flex items-center gap-2">
					<input
						type="file"
						multiple
						accept="image/*"
						onChange={handleFileInputChange}
						className="hidden"
						id="file-upload"
					/>
					<Button asChild variant="default" size="lg">
						<label htmlFor="file-upload" className="cursor-pointer">
							<Upload className="h-4 w-4 mr-2" />
							Upload Images
						</label>
					</Button>
				</div>
				<Button variant="outline">Browse Gallery</Button>
			</div>
		</div>
	);

	return (
		<div
			className="container mx-auto p-3 md:p-6 pt-0! space-y-4 md:space-y-6"
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{isDragging && (
				<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
					<div className="bg-card border-2 border-dashed border-primary rounded-lg p-12 text-center max-w-md mx-4">
						<Upload className="h-12 w-12 text-primary mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							Drop your images here
						</h3>
						<p className="text-muted-foreground text-sm">
							Release to upload your image files
						</p>
					</div>
				</div>
			)}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push("/frames/list")}
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Frames
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader className="gap-0">
							<div className="flex items-start justify-between">
								<div className="space-y-2">
									<div className="flex items-center flex-wrap gap-3 pr-4">
										<h1 className="text-3xl font-bold">{frame.title}</h1>
										{getStatusIcon(frame.status)}
										{getStatusBadge(frame.status)}
									</div>
									<div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-4 text-muted-foreground">
										<span className="flex items-center gap-2">
											<Monitor className="size-4" />
											{frame.model}
										</span>
										<span className="flex items-center gap-2">
											<MapPin className="size-4" />
											{frame.location}
										</span>
									</div>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											title="Coming Soon"
											className="hover:cursor-not-allowed"
										>
											<RotateCcw className="h-4 w-4 mr-2" />
											Restart Frame
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem className="text-red-600">
											<Trash2 className="h-4 w-4 mr-2" />
											Remove Frame
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardHeader>
					</Card>
				</div>

				<div className="">
					<Card className="gap-2 md:gap-4">
						<CardHeader>
							<CardTitle className="text-lg">System Status</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">
										Last Sync
									</span>
									<span className="text-sm font-medium">
										{frame.lastSync ?? "N/A"}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Uptime</span>
									<span
										className="text-sm font-medium"
										title={new Date("2025-07-27T16:32:12").toLocaleString()}
									>
										{/* {frame.uptime} */}
										{getRelativeTime(new Date("2025-07-27T16:32:12"))}
									</span>
								</div>
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Storage</span>
									<span className="text-sm font-medium">1.5GB / 32GB</span>
								</div>
								<Progress
									// value={(frame.storageUsed / frame.storageTotal) * 100}
									value={4.6}
									className="h-2"
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Separator />

			<div className="space-y-4 md:space-y-6 px-4">
				<div className="flex items-start justify-between">
					<h2 className="text-2xl font-bold">Media</h2>
					<div className="flex flex-col gap-2">
						<div className="flex gap-2">
							<Badge variant="secondary" className="text-sm">
								{mediaFiles.length} {mediaFiles.length === 1 ? "file" : "files"}
							</Badge>
							<div className="flex items-center gap-2">
								<input
									type="file"
									multiple
									accept="image/*"
									onChange={handleFileInputChange}
									className="hidden"
									id="file-upload"
								/>
								<Button asChild variant="default" size="lg">
									<label htmlFor="file-upload" className="cursor-pointer">
										<Upload className="h-4 w-4 mr-2" />
										Upload Images
									</label>
								</Button>
							</div>
						</div>
						{isPending && (
							<div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
								<div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
								Uploading...
							</div>
						)}
						{isError && (
							<div className="flex items-center justify-end gap-2 text-sm text-rose-400">
								<FileWarning className="size-4" />
								Upload error
							</div>
						)}
					</div>
				</div>

				{isLoadingMedia ? (
					<div className="text-center py-12">
						<div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
						<p className="text-muted-foreground">Loading media files...</p>
					</div>
				) : mediaError ? (
					<div className="text-center py-12">
						<p className="text-red-500 mb-2">Error loading media files</p>
						<p className="text-muted-foreground text-sm">
							{mediaError.message}
						</p>
					</div>
				) : mediaFiles.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{mediaFiles
							.sort((a, b) => {
								if (a.lastmodified > b.lastmodified) return -1;
								return 1;
							})
							.map((item) => (
								<ImageCard key={item.key} item={item} />
							))}
					</div>
				) : (
					<EmptyState />
				)}
			</div>
		</div>
	);
}
