"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
	ArrowLeft,
	Wifi,
	WifiOff,
	Monitor,
	MapPin,
	Upload,
	MoreHorizontal,
	Play,
	RotateCcw,
	Trash2,
	Download,
	Eye,
	Calendar,
	ImageIcon,
} from "lucide-react";

import ImageCard from "./imageCard";
import { ClockCountdownIcon } from "@phosphor-icons/react/dist/ssr/ClockCountdown";
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
import { FileObject } from "@/app/lib/r2";

interface Props {
	frame: Frame;
	files: FileObject[];
}

export default function FramePage({ frame, files }: Props) {
	const params = useParams();
	const router = useRouter();
	const [selectedMedia, setSelectedMedia] = useState<string[]>([]);

	const getStatusIcon = (status: string | null) => {
		if (!status) return;

		switch (status) {
			case "online":
				return <Wifi className="h-5 w-5 text-green-500" />;
			case "offline":
				return <WifiOff className="h-5 w-5 text-red-500" />;
			case "syncing":
				return <Monitor className="h-5 w-5 text-blue-500 animate-pulse" />;
			default:
				return <WifiOff className="h-5 w-5 text-gray-400" />;
		}
	};

	const getStatusBadge = (status: string | null) => {
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

	const EmptyState = () => (
		<div className="flex flex-col items-center justify-center py-16 px-4">
			<div className="relative mb-6">
				{/* Simple illustration using CSS and icons */}
				<div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
					<div className="relative">
						<ImageIcon className="h-12 w-12 text-blue-400 mb-2" />
						<div className="flex gap-1 justify-center">
							<div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
							<div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
							<div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
						</div>
					</div>
					{/* Decorative elements */}
					<div className="absolute top-2 right-2 w-4 h-4 bg-white/30 rounded-full"></div>
					<div className="absolute bottom-3 left-3 w-3 h-3 bg-white/20 rounded-full"></div>
					<div className="absolute top-1/2 left-2 w-2 h-2 bg-white/25 rounded-full"></div>
				</div>
			</div>
			<h3 className="text-xl font-semibold text-gray-900 mb-2">
				No media uploaded yet
			</h3>
			<p className="text-gray-500 text-center mb-6 max-w-sm">
				Upload your first images to start displaying beautiful memories on your
				digital frame.
			</p>
			<div className="flex gap-3">
				<Button>
					<Upload className="h-4 w-4 mr-2" />
					Upload Images
				</Button>
				<Button variant="outline">Browse Gallery</Button>
			</div>
		</div>
	);

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header Navigation */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" onClick={() => router.back()}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Frames
				</Button>
			</div>

			{/* Frame Header */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main Info */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="space-y-2">
									<div className="flex items-center gap-3">
										<h1 className="text-3xl font-bold">{frame.title}</h1>
										{getStatusIcon(frame.status)}
										{getStatusBadge(frame.status)}
									</div>
									<div className="flex items-center gap-4 text-muted-foreground">
										<span className="flex items-center gap-1">
											<Monitor className="h-4 w-4" />
											{frame.model}
										</span>
										<span className="flex items-center gap-1">
											<MapPin className="h-4 w-4" />
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
											className="hover:cursor-disabled"
										>
											<RotateCcw className="h-4 w-4 mr-2" />
											Restart Frame
											<ClockCountdownIcon className="size-5 text-stone-300/40" />
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
						<CardContent>
							<div className="grid gap-6 md:grid-cols-2">
								{/* Current Display */}
								<div className="space-y-3">
									<h3 className="font-semibold">Current Display</h3>
									<div className="relative overflow-hidden rounded-lg bg-muted">
										<Image
											fill={true}
											src={frame.currentImage || "/placeholder.svg"}
											alt="Current display"
											className="h-48 w-full object-cover"
										/>
										<div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
											<Button size="sm" variant="secondary">
												<Eye className="h-4 w-4 mr-2" />
												Preview
											</Button>
										</div>
									</div>
								</div>

								{/* Quick Stats */}
								<div className="space-y-4">
									<h3 className="font-semibold">Quick Stats</h3>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-sm text-muted-foreground">
												Last Sync
											</span>
											<span className="text-sm font-medium">
												{frame.lastSync}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-muted-foreground">
												Uptime
											</span>
											<span className="text-sm font-medium">
												{/* {frame.uptime} */}
												12 days 3 hrs
											</span>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* System Info */}
				<div className="space-y-6">
					{/* Battery & Storage */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">System Status</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Storage</span>
									<span className="text-sm text-muted-foreground">
										{/* {frame.storageUsed}GB / {frame.storageTotal}GB */}
										2GB / 12GB
									</span>
								</div>
								<Progress
									// value={(frame.storageUsed / frame.storageTotal) * 100}
									value={64}
									className="h-2"
								/>
							</div>

							{/* <div className="space-y-2"> */}
							{/* 	<div className="flex items-center justify-between"> */}
							{/* 		<span className="text-sm font-medium">WiFi Signal</span> */}
							{/* 		<span className="text-sm text-muted-foreground"> */}
							{/* 			{frame.wifiSignal}% */}
							{/* 		</span> */}
							{/* 	</div> */}
							{/* 	<Progress value={frame.wifiSignal} className="h-2" /> */}
							{/* </div> */}
						</CardContent>
					</Card>

					{/* Technical Details */}
					{/* <Card> */}
					{/* 	<CardHeader> */}
					{/* 		<CardTitle className="text-lg">Technical Details</CardTitle> */}
					{/* 	</CardHeader> */}
					{/* 	<CardContent className="space-y-3"> */}
					{/* 		<div className="flex justify-between"> */}
					{/* 			<span className="text-sm text-muted-foreground"> */}
					{/* 				Serial Number */}
					{/* 			</span> */}
					{/* 			<span className="text-sm font-mono">{frame.serialNumber}</span> */}
					{/* 		</div> */}
					{/* 		<div className="flex justify-between"> */}
					{/* 			<span className="text-sm text-muted-foreground">Firmware</span> */}
					{/* 			<span className="text-sm">{frame.firmwareVersion}</span> */}
					{/* 		</div> */}
					{/* 		<div className="flex justify-between"> */}
					{/* 			<span className="text-sm text-muted-foreground"> */}
					{/* 				Temperature */}
					{/* 			</span> */}
					{/* 			<span className="text-sm">{frame.temperature}°C</span> */}
					{/* 		</div> */}
					{/* 	</CardContent> */}
					{/* </Card> */}
				</div>
			</div>

			<Separator />

			{/* Media Management */}
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold">Media Library</h2>
						<p className="text-muted-foreground">
							Manage images and content for this frame
						</p>
					</div>
					<div className="flex gap-2">
						{/* <Button variant="outline"> */}
						{/* 	<Download className="h-4 w-4 mr-2" /> */}
						{/* 	Export All */}
						{/* </Button> */}
						<Button onClick={() => router.push("/dashboard/media/view")}>
							<Upload className="h-4 w-4 mr-2" />
							Upload Media
						</Button>
					</div>
				</div>

				{files.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{files.map((item) => (
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
