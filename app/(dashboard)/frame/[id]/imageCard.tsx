import {
	Trash2,
	Download,
	Calendar,
	File,
	UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import PreviewDialog from "./previewDialog";
import { formatDate, formatFileSize } from "@/lib/utils";
import { type MediaFile, useDeleteMedia } from "@/app/lib/queries/media";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ImageCard({ item }: { item: MediaFile }) {
	const [showPreviewModal, setShowPreviewModal] = useState(false);
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

	const showPreviewImage = () => {
		setShowPreviewModal(true);
	};

	return (
		<>
			<Card key={item.key} className="overflow-hidden gap-2 pt-0 pb-2">
				<button
					type="button"
					className="block w-full cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
					onClick={showPreviewImage}
					aria-label={`Preview ${item.name}`}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={item.url} alt={item.name} className="block h-auto w-full" />
				</button>
				<CardContent className="p-3">
					<h4 className="font-medium text-sm truncate">{item.name}</h4>
					<div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
						<span className="flex items-center gap-1 text-sm">
							<File className="size-4" />
							{formatFileSize(item.size)}
						</span>
					</div>
					<div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
						<div className="flex min-w-0 items-center gap-3">
							<span
								className="flex shrink-0 items-center gap-1 text-sm"
								title={format(item.lastmodified, "PPPppp")}
							>
								<Calendar className="size-4" />
								{formatDate(item.lastmodified)}
							</span>
							<span className="flex min-w-0 items-center gap-1 truncate text-sm">
								<UserRound className="size-4 shrink-0" />
								{item.uploadedBy ?? "Unknown"}
							</span>
						</div>
						<div className="flex shrink-0 items-center">
							<Button
								variant="ghost"
								size="icon"
								className="size-11"
								type="button"
								onClick={handleDownload}
								aria-label={`Download ${item.name}`}
							>
								<Download />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="size-11 text-destructive hover:text-destructive"
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
				<PreviewDialog
					image={item}
					open={showPreviewModal}
					toggleModal={(close) => setShowPreviewModal(close)}
				/>
			</Card>
		</>
	);
}
