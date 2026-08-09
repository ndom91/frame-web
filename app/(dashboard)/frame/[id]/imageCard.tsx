import { Trash2, Download, Calendar, File, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	formatDate,
	formatDateTime,
	formatFileSize,
	imageSrcSet,
	sizedImageUrl,
} from "@/lib/utils";
import { useLocale } from "@/app/lib/use-locale";
import { type MediaFile, useDeleteMedia } from "@/app/lib/queries/media";
import { toast } from "sonner";

export default function ImageCard({ item, isActive }: { item: MediaFile; isActive: boolean }) {
	const locale = useLocale();
	const deleteMedia = useDeleteMedia();

	const handleDelete = async (file: MediaFile) => {
		try {
			await deleteMedia.mutateAsync(file.key);
		} catch {
			toast.error("Could not delete the image. Please try again.");
		}
	};

	const handleDownload = async () => {
		if (!item.url) return;

		// The full-resolution original, not the grid's resized variant. Cross-origin
		// fetch drops cookies unless asked, and the images Worker answers an
		// unauthenticated request with 403 — hence `credentials`.
		const response = await fetch(item.url, { credentials: "include" });
		const blobImage = await response.blob();
		const href = URL.createObjectURL(blobImage);

		const a = document.createElement("a");
		a.target = "_blank";
		a.style.display = "none";
		a.href = href;
		a.download = item.name;

		document.body.appendChild(a);
		a.click();

		setTimeout(() => {
			document.body.removeChild(a);
			URL.revokeObjectURL(href);
		}, 0);
	};

	return (
		<Card className={isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background gap-0 overflow-hidden py-0" : "gap-0 overflow-hidden py-0"}>
			{/* `sizes` tracks the masonry breakpoints in virtualized-masonry-grid.tsx
			    (4 columns ≥1280px, 3 ≥1024, 2 ≥768, else 1), minus the sidebar. */}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={sizedImageUrl(item.url, 800)}
				srcSet={imageSrcSet(item.url)}
				sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 768px) 45vw, 92vw"
				alt={item.name}
				loading="lazy"
				decoding="async"
				className="block h-auto w-full"
			/>
			{/* One centred row: the filename/meta block and the actions are siblings,
			    so tall buttons no longer inflate the meta line and leave more
			    whitespace below the text than above it. */}
			<CardContent className="flex items-center justify-between gap-2 px-3 py-2">
				<div className="min-w-0 flex-1">
					<h4 className="truncate text-sm font-medium">{item.name}</h4>
					{isActive && <p className="text-xs text-primary">Currently displaying</p>}
					<div className="mt-0.5 flex min-w-0 items-center gap-2.5 text-xs text-muted-foreground">
						<span className="flex shrink-0 items-center gap-1">
							<File aria-hidden="true" className="size-3.5" />
							{formatFileSize(item.size, locale)}
						</span>
						<span
							className="flex shrink-0 items-center gap-1"
							title={formatDateTime(item.lastmodified, locale)}
						>
							<Calendar aria-hidden="true" className="size-3.5" />
							{formatDate(item.lastmodified, locale)}
						</span>
						{/* Only shown when known. Photos uploaded before the media table
						    was populated have no row, and rendering "Unknown" on every
						    card was noise. */}
						{item.uploadedBy && (
							<span className="flex min-w-0 items-center gap-1 truncate">
								<UserRound aria-hidden="true" className="size-3.5 shrink-0" />
								<span className="truncate">{item.uploadedBy}</span>
							</span>
						)}
					</div>
				</div>
				{/* 44px on touch viewports (the WCAG 2.5.5 target), tightened to 32px
				    from sm: up where a cursor is doing the aiming. */}
				<div className="-mr-2 flex shrink-0 items-center sm:-mr-1.5">
					<Button
						variant="ghost"
						size="icon"
						className="size-11 sm:size-8"
						type="button"
						onClick={handleDownload}
						aria-label={`Download ${item.name}`}
					>
						<Download />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="size-11 text-destructive hover:text-destructive sm:size-8"
						type="button"
						onClick={() => void handleDelete(item)}
						disabled={deleteMedia.isPending}
						aria-label={`Delete ${item.name}`}
					>
						<Trash2 />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
