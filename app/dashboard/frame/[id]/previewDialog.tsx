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
	// DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PreviewDialog({ image }: { image: FileObject }) {
	return (
		<Dialog defaultOpen={true}>
			<form>
				{/* <DialogTrigger asChild> */}
				{/* 	<Button variant="outline">Open Dialog</Button> */}
				{/* </DialogTrigger> */}
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Image Preview</DialogTitle>
						<DialogDescription>
							<img src={image.url} alt={image.name} />
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">Cancel</Button>
						</DialogClose>
						<Button type="submit">Save changes</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
