"use client";

import { useState } from "react";
import { MonitorIcon } from "@phosphor-icons/react/dist/ssr/Monitor";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/ssr/DotsThree";
import { FunnelIcon } from "@phosphor-icons/react/dist/ssr/Funnel";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { ClockCountdownIcon } from "@phosphor-icons/react/dist/ssr/ClockCountdown";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Frame from "./frameCard";
import { useFrames } from "@/app/lib/queries/frames";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { redirect } from "next/navigation";

export default function FramesPage() {
	const { data: frames = [], isLoading, error } = useFrames();
	const [selectedFrames, setSelectedFrames] = useState<number[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	const filteredFrames = frames.filter((frame) => {
		const matchesSearch =
			frame.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			frame.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			frame.model?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || frame.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const handleSelectAll = () => {
		if (selectedFrames.length === filteredFrames.length) {
			setSelectedFrames([]);
		} else {
			setSelectedFrames(filteredFrames.map((frame) => frame.id));
		}
	};

	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<div className="text-center py-12">
					<h3 className="text-lg font-semibold mb-2">Loading frames...</h3>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto p-6">
				<div className="text-center py-12">
					<h3 className="text-lg font-semibold mb-2 text-red-500">
						Error loading frames
					</h3>
					<p className="text-muted-foreground">{error.message}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6  pt-0!">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Digital Frames</h1>
					<p className="text-muted-foreground">
						Manage and control your digital picture frames
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={() => redirect("/frames/add")}>Add New Frame</Button>
				</div>
			</div>

			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex flex-1 items-center gap-2">
					<div className="relative flex-1 max-w-sm">
						<MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-42">
							<FunnelIcon className="h-4 w-4 mr-2" />
							<SelectValue className="justify-start" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="online">Online</SelectItem>
							<SelectItem value="offline">Offline</SelectItem>
							<SelectItem value="syncing">Syncing</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{selectedFrames.length > 0 && (
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">
							{selectedFrames.length} selected
						</span>
						{/* <Button variant="outline" size="sm"> */}
						{/* 	Sync Selected */}
						{/* </Button> */}
						{/* <Button variant="outline" size="sm"> */}
						{/* 	Update Content */}
						{/* </Button> */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									<DotsThreeIcon className="size-5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem
									className="hover:cursor-disabled"
									title="Coming Soon"
								>
									Restart Selected <ClockCountdownIcon className="size-5" />
								</DropdownMenuItem>
								{/* <DropdownMenuItem>Change Settings</DropdownMenuItem> */}
								<DropdownMenuSeparator />
								<DropdownMenuItem className="text-rose-400">
									Remove Selected
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Checkbox
					checked={
						selectedFrames.length === filteredFrames.length &&
						filteredFrames.length > 0
					}
					onCheckedChange={handleSelectAll}
				/>
				<span className="text-sm text-muted-foreground">
					Select all ({filteredFrames.length} frames)
				</span>
			</div>

			<div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
				{filteredFrames.map((frame) => (
					<Frame
						key={frame.id}
						frame={frame}
						selectedFrames={selectedFrames}
						setSelectedFrames={setSelectedFrames}
					/>
				))}
			</div>

			{filteredFrames.length === 0 && (
				<div className="text-center py-12">
					<MonitorIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-semibold mb-2">No frames found</h3>
					<p className="text-muted-foreground mb-4">
						{searchQuery || statusFilter !== "all"
							? "Try adjusting your search or filters"
							: "Get started by adding your first digital frame"}
					</p>
					<Button onClick={() => redirect("/frames/add")}>Add New Frame</Button>
				</div>
			)}
		</div>
	);
}
