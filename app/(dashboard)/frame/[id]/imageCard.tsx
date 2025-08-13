import {
	MoreHorizontal,
	Trash2,
	Download,
	Eye,
	Calendar,
	File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { FileObject } from "@/app/lib/r2";
import { useState, useRef, useEffect, useMemo } from "react";
import PreviewDialog from "./previewDialog";
import { formatFileSize, getRelativeTime } from "@/lib/utils";
import { useDeleteMedia } from "@/app/lib/queries/media";

export default function ImageCard({ item }: { item: FileObject }) {
	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const deleteMedia = useDeleteMedia();
	const imageRef = useRef<HTMLImageElement>(null);
	const [scrollY, setScrollY] = useState(0);

	const parallaxRate = useMemo(() => {
		return Math.random() * 2;
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			if (imageRef.current) {
				const rect = imageRef.current.getBoundingClientRect();
				const scrollProgress =
					(window.innerHeight - rect.top) / (window.innerHeight + rect.height);
				setScrollY(scrollProgress * 20 * parallaxRate - 10 * parallaxRate);
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => window.removeEventListener("scroll", handleScroll);
	}, [parallaxRate]);

	const objectOffset = useMemo(() => {
		const yOffset = (Math.random() - 0.5) * 80;
		return `0 calc(50% + ${yOffset}px)`;
	}, []);

	const handleDelete = (file: FileObject) => {
		deleteMedia.mutateAsync(file.key);
	};

	const handleDownload = async () => {
		if (!item.url) return;

		const response = await fetch(item.url);
		const blobImage = await response.blob();
		const href = URL.createObjectURL(blobImage);

		const a = document.createElement("a");
		a.target = "_blank";
		a.style.display = "none";
		a.href = href;
		a.download = item.name;

		document.body.appendChild(a);
		a.click();

		// Firefox workaround
		setTimeout(() => {
			document.body.removeChild(a);
		}, 0);
	};

	const showPreviewImage = () => {
		setShowPreviewModal(true);
	};

	return (
		<>
			<Card key={item.key} className="overflow-hidden gap-2 pt-0 pb-2">
				<div className="relative overflow-hidden">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						ref={imageRef}
						alt="Image"
						src={`https://${process.env.NEXT_PUBLIC_IMAGE_HOSTNAME}/${item.key}`}
						className="h-56 w-full object-cover object-center"
						style={{
							transform: `translateY(${scrollY}px)`,
							objectPosition: objectOffset,
						}}
					/>
					<div className="absolute top-2 right-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="secondary" size="sm">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={showPreviewImage}>
									<Eye className="h-4 w-4 mr-2" />
									Preview
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleDownload}>
									<Download className="h-4 w-4 mr-2" />
									Download
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-red-600"
									onClick={() => handleDelete(item)}
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				<CardContent className="p-3">
					<h4 className="font-medium text-sm truncate">{item.name}</h4>
					<div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
						<span className="flex items-start gap-1 text-sm">
							<File className="size-4" />
							{formatFileSize(item.size)}
						</span>
						<span
							className="flex items-start gap-1 text-sm "
							title={item.lastmodified.toLocaleString()}
						>
							<Calendar className="size-4" />
							{getRelativeTime(item.lastmodified)}
						</span>
					</div>
				</CardContent>
				{showPreviewModal && <PreviewDialog image={item} />}
			</Card>
		</>
	);
}
