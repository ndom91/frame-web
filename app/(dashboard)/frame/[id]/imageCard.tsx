import { Trash2, Download, Calendar, File, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatDateTime, formatFileSize } from "@/lib/utils";
import { useLocale } from "@/app/lib/use-locale";
import { type MediaFile, useDeleteMedia } from "@/app/lib/queries/media";
import { toast } from "sonner";

export default function ImageCard({ item }: { item: MediaFile }) {
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

		setTimeout(() => {
			document.body.removeChild(a);
			URL.revokeObjectURL(href);
		}, 0);
	};

	return (
		<Card className="gap-0 overflow-hidden py-0">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={item.url} alt={item.name} className="block h-auto w-full" />
			<CardContent className="px-3 py-2">
				<h4 className="truncate text-sm font-medium">{item.name}</h4>
				<div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
					<div className="flex min-w-0 items-center gap-2.5">
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
					<div className="-mr-1.5 flex shrink-0 items-center">
						<Button
							variant="ghost"
							size="icon"
							className="size-8"
							type="button"
							onClick={handleDownload}
							aria-label={`Download ${item.name}`}
						>
							<Download />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="size-8 text-destructive hover:text-destructive"
							type="button"
							onClick={() => void handleDelete(item)}
							disabled={deleteMedia.isPending}
							aria-label={`Delete ${item.name}`}
						>
							<Trash2 />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
