import { FileObject } from "@/app/lib/r2";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { formatFileSize } from "@/lib/utils";
import { format } from "date-fns";

export default function PreviewDialog({
	image,
	open = false,
	toggleModal,
}: {
	image: FileObject;
	open: boolean;
	toggleModal: (close: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={toggleModal}>
			<form>
				<DialogContent className="max-sm:h-[calc(100vh-2rem)] max-sm:max-w-[calc(100vw-2rem)] max-sm:w-full sm:max-w-[425px] p-0">
					<DialogHeader className="p-6">
						<DialogTitle>{image.name}</DialogTitle>
						<DialogDescription className="flex justify-between w-full">
							<span>{formatFileSize(image.size)}</span>
							<span>{format(image.lastmodified, "PPpp")}</span>
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-center items-center overflow-hidden">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={image.url}
							alt={image.name}
							className="max-w-full max-h-full object-contain"
						/>
					</div>
					<DialogFooter className="p-6">
						<DialogClose asChild>
							<Button variant="outline" onClick={() => toggleModal(false)}>
								Close
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
