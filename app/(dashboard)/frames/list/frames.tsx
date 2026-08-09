"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { MonitorIcon } from "@phosphor-icons/react/dist/ssr/Monitor";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/ssr/DotsThree";
import { FunnelIcon } from "@phosphor-icons/react/dist/ssr/Funnel";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import SkeletonCard from "@/components/card-skeleton";
import Frame from "./frameCard";
import { useDeleteFrame, useFrames } from "@/app/lib/queries/frames";
import { useFramesOverview } from "@/app/lib/queries/media";
import { ConfirmDialog } from "@/components/confirm-dialog";
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

export default function FramesPage() {
	const { data: frames = [], isLoading, error } = useFrames();
	const { data: overview = [] } = useFramesOverview();
	const deleteFrame = useDeleteFrame();
	const [selectedFrames, setSelectedFrames] = useState<number[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

	const searchId = useId();
	const selectAllId = useId();

	const filteredFrames = frames.filter((frame) => {
		const query = searchQuery.toLowerCase();
		const matchesSearch =
			frame.title?.toLowerCase().includes(query) ||
			frame.location?.toLowerCase().includes(query) ||
			frame.model?.toLowerCase().includes(query);
		const matchesStatus =
			statusFilter === "all" || frame.status === statusFilter;
		return matchesSearch && matchesStatus;
	});
	const previewByFrameId = new Map(
		overview.map((entry) => [entry.id, entry.activePreviewUrl ?? entry.previewUrl]),
	);

	const allSelected =
		filteredFrames.length > 0 &&
		selectedFrames.length === filteredFrames.length;

	const handleSelectAll = () => {
		if (allSelected) {
			setSelectedFrames([]);
		} else {
			setSelectedFrames(filteredFrames.map((frame) => frame.id));
		}
	};

	const handleRemoveSelected = async () => {
		const results = await Promise.allSettled(
			selectedFrames.map((id) => deleteFrame.mutateAsync(id)),
		);

		const failed = results.filter((result) => result.status === "rejected");
		const removed = results.length - failed.length;

		if (removed > 0) {
			toast.success(`Removed ${removed} ${removed === 1 ? "frame" : "frames"}`);
		}
		if (failed.length > 0) {
			toast.error(
				`Couldn't remove ${failed.length} ${failed.length === 1 ? "frame" : "frames"}`,
				{ description: "Check your connection and try again." },
			);
		}

		setSelectedFrames([]);
	};

	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<div
					role="status"
					aria-live="polite"
					className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
				>
					<span className="sr-only">Loading frames…</span>
					{Array.from({ length: 6 }).map((_, index) => (
						<SkeletonCard key={index} />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto p-6">
				<div role="alert" className="py-12 text-center">
					<h2 className="mb-2 text-lg font-semibold text-destructive">
						Couldn&rsquo;t load frames
					</h2>
					<p className="text-muted-foreground">{error.message}</p>
					<p className="text-muted-foreground mt-1 text-sm">
						Reload the page to try again.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-6 p-6 pt-0!">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Digital Frames</h1>
					<p className="text-muted-foreground">
						Manage and control your digital picture frames
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button asChild>
						<Link href="/frames/add">Add New Frame</Link>
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex flex-1 items-center gap-2">
					<div className="relative max-w-sm flex-1">
						<label htmlFor={searchId} className="sr-only">
							Search frames
						</label>
						<MagnifyingGlassIcon
							aria-hidden="true"
							className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							id={searchId}
							name="search"
							type="search"
							autoComplete="off"
							spellCheck={false}
							placeholder="Search by name, location, or model…"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-42" aria-label="Filter by status">
							<FunnelIcon aria-hidden="true" className="mr-2 h-4 w-4" />
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
						<span className="text-sm text-muted-foreground tabular-nums">
							{selectedFrames.length} selected
						</span>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									aria-label="Actions for selected frames"
								>
									<DotsThreeIcon aria-hidden="true" className="size-5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
							<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									onSelect={(event) => {
										event.preventDefault();
										setConfirmRemoveOpen(true);
									}}
								>
									Remove Selected
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Checkbox
					id={selectAllId}
					checked={allSelected}
					onCheckedChange={handleSelectAll}
				/>
				<label
					htmlFor={selectAllId}
					className="text-sm text-muted-foreground select-none"
				>
					Select all ({filteredFrames.length}{" "}
					{filteredFrames.length === 1 ? "frame" : "frames"})
				</label>
			</div>

			<div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
				{filteredFrames.map((frame) => (
					<Frame
						key={frame.id}
						frame={frame}
						selectedFrames={selectedFrames}
						setSelectedFrames={setSelectedFrames}
						previewUrl={previewByFrameId.get(frame.id)}
					/>
				))}
			</div>

			{filteredFrames.length === 0 && (
				<div className="py-12 text-center">
					<MonitorIcon
						aria-hidden="true"
						className="mx-auto mb-4 h-12 w-12 text-muted-foreground"
					/>
					<h2 className="mb-2 text-lg font-semibold">No frames found</h2>
					<p className="text-muted-foreground mb-4">
						{searchQuery || statusFilter !== "all"
							? "Try adjusting your search or filters"
							: "Get started by adding your first digital frame"}
					</p>
					<Button asChild>
						<Link href="/frames/add">Add New Frame</Link>
					</Button>
				</div>
			)}

			<ConfirmDialog
				open={confirmRemoveOpen}
				onOpenChange={setConfirmRemoveOpen}
				title={`Remove ${selectedFrames.length} ${selectedFrames.length === 1 ? "frame" : "frames"}?`}
				description="This removes the selected frames from your account. Images already uploaded to them are not deleted."
				confirmLabel="Remove Selected"
				pending={deleteFrame.isPending}
				onConfirm={handleRemoveSelected}
			/>
		</div>
	);
}
