import {
	ArrowLeft,
	Wifi,
	WifiOff,
	Monitor,
	MapPin,
	Upload,
	MoreHorizontal,
	Play,
	RotateCcw,
	Trash2,
	Download,
	Eye,
	Calendar,
	ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileObject } from "@/app/lib/r2";
import { useState } from "react";
import PreviewDialog from "./previewDialog";

export default function ImageCard({ item }: { item: FileObject }) {
	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const [previewImage, setPreviewImage] = useState<FileObject>();

	const showPreviewImage = (item: FileObject) => {
		setShowPreviewModal(true);
		setPreviewImage(item);
	};

	const formatFileSize = (input: number | string | undefined) => {
		if (!input) return;
		let bytes: number;

		if (typeof input === "string") {
			bytes = parseInt(input);
		} else {
			bytes = input;
		}
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	};

	const formatDate = (input: string | Date | undefined) => {
		if (!input) return;
		let date;

		if (typeof input === "string") {
			date = new Date(input);
		} else {
			date = input;
		}

		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<>
			<Card key={item.key} className="overflow-hidden gap-2 pt-0 pb-2">
				<div className="relative">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						alt="Image"
						src={`https://${process.env.NEXT_PUBLIC_IMAGE_HOSTNAME}/${item.key}`}
						className="h-36 w-full object-cover object-center"
					/>
					<div className="absolute top-2 right-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="secondary" size="sm">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => showPreviewImage(item)}>
									<Eye className="h-4 w-4 mr-2" />
									Preview
								</DropdownMenuItem>
								{/* <DropdownMenuItem> */}
								{/* 	<Play className="h-4 w-4 mr-2" /> */}
								{/* 	Display Now */}
								{/* </DropdownMenuItem> */}
								<DropdownMenuItem>
									<Download className="h-4 w-4 mr-2" />
									Download
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="text-red-600">
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
						<span>{formatFileSize(item.size)}</span>
						<span className="flex items-center gap-1">
							<Calendar className="h-3 w-3" />
							{formatDate(item.lastModified)}
						</span>
					</div>
				</CardContent>
				{showPreviewModal && <PreviewDialog image={item} />}
			</Card>
		</>
	);
}
