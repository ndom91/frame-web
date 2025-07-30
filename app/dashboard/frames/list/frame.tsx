"use client";

import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { DotsThreeCircleIcon } from "@phosphor-icons/react/dist/ssr/DotsThreeCircle";
import { PulseIcon } from "@phosphor-icons/react/dist/ssr/Pulse";
import { MapPinIcon } from "@phosphor-icons/react/dist/ssr/MapPin";
import { ClockIcon } from "@phosphor-icons/react/dist/ssr/Clock";
import { WifiHighIcon } from "@phosphor-icons/react/dist/ssr/WifiHigh";
import { WifiSlashIcon } from "@phosphor-icons/react/dist/ssr/WifiSlash";
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
import type { Frame } from "@/lib/types";

interface Props {
	frame: Frame;
	selectedFrames: number[];
	setSelectedFrames: Dispatch<SetStateAction<number[]>>;
}

export default function Frame({
	frame,
	selectedFrames,
	setSelectedFrames,
}: Props) {
	const router = useRouter();

	const handleSelectFrame = (frameId: number) => {
		setSelectedFrames((prev) =>
			prev.includes(frameId)
				? prev.filter((id) => id !== frameId)
				: [...prev, frameId],
		);
	};

	const getStatusIcon = (status: string | null) => {
		if (!status) return;

		switch (status) {
			case "online":
				return <WifiHighIcon className="size-5 text-lime-500" />;
			case "offline":
				return <WifiSlashIcon className="size-5 text-rose-500" />;
			case "syncing":
				return <PulseIcon className="size-5 text-sky-500 animate-pulse" />;
			default:
				return <WifiSlashIcon className="size-5 text-gray-400" />;
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
	return (
		<Card key={frame.id} className="overflow-hidden gap-0">
			<CardHeader className="">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-2">
						<Checkbox
							checked={selectedFrames.includes(frame.id)}
							onCheckedChange={() => handleSelectFrame(frame.id)}
						/>
						<div>
							<h3 className="font-semibold">{frame.title}</h3>
							<p className="text-sm text-muted-foreground">{frame.model}</p>
						</div>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm">
								<DotsThreeCircleIcon className="size-6" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => router.push(`/dashboard/frame/${frame.id}`)}
							>
								View Details
							</DropdownMenuItem>
							<DropdownMenuItem>Sync Now</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => router.push(`/dashboard/frame/${frame.id}`)}
							>
								Settings
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-red-600">
								Remove Frame
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="relative overflow-hidden rounded-lg bg-muted">
					<Image
						fill={true}
						src={frame.currentImage || "https://unsplash.it/300/200?random"}
						alt={`Current display on ${frame.title}`}
						className="h-32 w-full object-cover relative!"
					/>
					<div className="absolute top-2 right-2 rounded-md bg-stone-200/70 p-1">
						{getStatusIcon(frame.status)}
					</div>
				</div>

				<div className="">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1 text-sm text-muted-foreground">
							<MapPinIcon className="size-4" />
							{frame.location}
						</div>
						{getStatusBadge(frame.status)}
					</div>

					{frame.status !== "offline" && (
						<div className="flex items-center gap-1 text-sm text-muted-foreground">
							<ClockIcon className="size-4" />
							Last sync: {frame.lastSync}
						</div>
					)}
				</div>

				<div className="flex gap-2">
					{/* <Button variant="outline" size="sm" className="flex-1 bg-transparent"> */}
					{/* 	Sync Now */}
					{/* </Button> */}
					<Button
						variant="outline"
						size="sm"
						className="flex-1 bg-transparent"
						onClick={() => router.push(`/dashboard/frame/${frame.id}`)}
					>
						Manage
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
