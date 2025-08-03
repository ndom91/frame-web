"use client";

import type React from "react";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
	MoreVertical,
	Trash2,
	Download,
	Edit,
	Eye,
	Share,
	Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Mock data for demonstration
const mockFiles = [
	{
		id: "1",
		name: "landscape-photo.jpg",
		size: "2.4 MB",
		lastModified: "2 hours ago",
		url: "/placeholder.svg?height=200&width=300",
	},
	{
		id: "2",
		name: "portrait-session.jpg",
		size: "1.8 MB",
		lastModified: "1 day ago",
		url: "/placeholder.svg?height=200&width=300",
	},
	{
		id: "3",
		name: "product-shot.png",
		size: "3.2 MB",
		lastModified: "3 days ago",
		url: "/placeholder.svg?height=200&width=300",
	},
	{
		id: "4",
		name: "team-photo.jpg",
		size: "4.1 MB",
		lastModified: "1 week ago",
		url: "/placeholder.svg?height=200&width=300",
	},
	{
		id: "5",
		name: "architecture.jpg",
		size: "2.9 MB",
		lastModified: "2 weeks ago",
		url: "/placeholder.svg?height=200&width=300",
	},
	{
		id: "6",
		name: "nature-macro.jpg",
		size: "1.5 MB",
		lastModified: "3 weeks ago",
		url: "/placeholder.svg?height=200&width=300",
	},
];

export default function FileManager() {
	const [files, setFiles] = useState(mockFiles);
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const handleDelete = (fileId: string) => {
		setFiles(files.filter((file) => file.id !== fileId));
	};

	const handleDownload = (file: (typeof mockFiles)[0]) => {
		// In a real app, this would trigger a download
		console.log(`Downloading ${file.name}`);
	};

	const handleRename = (fileId: string) => {
		// In a real app, this would open a rename dialog
		console.log(`Renaming file ${fileId}`);
	};

	const handleView = (file: (typeof mockFiles)[0]) => {
		// In a real app, this would open the image in a modal or new tab
		console.log(`Viewing ${file.name}`);
	};

	const handleShare = (file: (typeof mockFiles)[0]) => {
		// In a real app, this would open a share dialog
		console.log(`Sharing ${file.name}`);
	};

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		// Only set dragging to false if we're leaving the main container
		if (e.currentTarget === e.target) {
			setIsDragging(false);
		}
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
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
	}, []);

	const handleFileUpload = async (uploadedFiles: File[]) => {
		setIsUploading(true);

		try {
			const newFiles = uploadedFiles.map((file, index) => ({
				id: `uploaded-${Date.now()}-${index}`,
				name: file.name,
				size: formatFileSize(file.size),
				lastModified: "Just now",
				url: URL.createObjectURL(file),
			}));

			// Simulate upload delay
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setFiles((prevFiles) => [...newFiles, ...prevFiles]);
		} catch (error) {
			console.error("Upload failed:", error);
		} finally {
			setIsUploading(false);
		}
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return (
			Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
		);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || []);
		const imageFiles = selectedFiles.filter((file) =>
			file.type.startsWith("image/"),
		);

		if (imageFiles.length > 0) {
			handleFileUpload(imageFiles);
		}

		// Reset input value
		e.target.value = "";
	};

	return (
		<div
			className="p-6 max-w-7xl mx-auto relative"
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
			<div className="mb-6">
				<h1 className="text-3xl font-bold tracking-tight">File Manager</h1>
				<p className="text-muted-foreground mt-2">
					Manage your image files with ease
				</p>
			</div>

			<div className="mb-4 flex items-center justify-between">
				<Badge variant="secondary" className="text-sm">
					{files.length} {files.length === 1 ? "file" : "files"}
				</Badge>
				<div className="flex items-center gap-2">
					{isUploading && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
							Uploading...
						</div>
					)}
					<input
						type="file"
						multiple
						accept="image/*"
						onChange={handleFileInputChange}
						className="hidden"
						id="file-upload"
					/>
					<Button asChild variant="outline" size="sm">
						<label htmlFor="file-upload" className="cursor-pointer">
							<Upload className="h-4 w-4 mr-2" />
							Upload Images
						</label>
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
				{files.map((file) => (
					<Card
						key={file.id}
						className="group overflow-hidden hover:shadow-md transition-shadow"
					>
						<CardContent className="p-0">
							<div className="relative aspect-[4/3] bg-muted">
								<Image
									src={file.url || "/placeholder.svg"}
									alt={file.name}
									fill
									className="object-cover"
									sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
								/>
								<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="secondary"
												size="icon"
												className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
											>
												<MoreVertical className="h-4 w-4" />
												<span className="sr-only">Open menu</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-48">
											<DropdownMenuItem onClick={() => handleView(file)}>
												<Eye className="mr-2 h-4 w-4" />
												View
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => handleDownload(file)}>
												<Download className="mr-2 h-4 w-4" />
												Download
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => handleShare(file)}>
												<Share className="mr-2 h-4 w-4" />
												Share
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem onClick={() => handleRename(file.id)}>
												<Edit className="mr-2 h-4 w-4" />
												Rename
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleDelete(file.id)}
												className="text-destructive focus:text-destructive"
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
							<div className="p-3">
								<h3 className="font-medium text-sm truncate" title={file.name}>
									{file.name}
								</h3>
								<div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
									<span>{file.size}</span>
									<span>{file.lastModified}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{files.length === 0 && (
				<div className="text-center py-12">
					<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 max-w-md mx-auto">
						<Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<div className="text-muted-foreground">
							<p className="text-lg font-medium mb-2">No files found</p>
							<p className="text-sm mb-4">
								Drag and drop images here, or click to upload
							</p>
							<Button asChild variant="outline">
								<label htmlFor="file-upload" className="cursor-pointer">
									Choose Images
								</label>
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
