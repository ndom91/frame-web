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
	const [scale, setScale] = useState(1);

	const parallaxRate = useMemo(() => {
		return Math.random() * 2;
	}, []);

	const scaleRate = useMemo(() => {
		return Math.random() * 0.05 + 1.02; // Random between 1.05-1.15
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			if (imageRef.current) {
				const rect = imageRef.current.getBoundingClientRect();
				const scrollProgress =
					(window.innerHeight - rect.top) / (window.innerHeight + rect.height);
				setScrollY(scrollProgress * 10 * parallaxRate - 10 * parallaxRate);
				setScale(1 + scrollProgress * (scaleRate - 1));
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => window.removeEventListener("scroll", handleScroll);
	}, [parallaxRate, scaleRate]);

	const backgroundPosition = useMemo(() => {
		const xOffset = (Math.random() - 0.5) * 40; // -20% to +20%
		const yOffset = (Math.random() - 0.5) * 40; // -20% to +20%
		return `${50 + xOffset}% ${50 + yOffset}%`;
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
				<div
					ref={imageRef}
					className="relative overflow-hidden h-56"
					style={{
						backgroundImage: `url(https://${process.env.NEXT_PUBLIC_IMAGE_HOSTNAME}/${item.key})`,
						backgroundSize: "cover",
						backgroundPosition: backgroundPosition,
						transform: `scale3d(${scale}, ${scale}, 1)`,
						transition: "transform 0.1s ease-in-out",
					}}
				>
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
