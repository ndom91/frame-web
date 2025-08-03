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
import { formatFileSize, getRelativeTime } from "@/lib/utils";

export default function PreviewDialog({ image }: { image: FileObject }) {
	return (
		<Dialog defaultOpen={true}>
			<form>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{image.name}</DialogTitle>
						<DialogDescription className="flex justify-between w-full">
							<span>{formatFileSize(image.size)}</span>
							<span>{getRelativeTime(image.lastmodified)}</span>
						</DialogDescription>
					</DialogHeader>
					<div className="flex">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={image.url} alt={image.name} />
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">Close</Button>
						</DialogClose>
						{/* <Button type="submit">Save changes</Button> */}
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
