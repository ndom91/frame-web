export type Frame = {
	id: number;
	title: string;
	location: string;
	model: string;
	createdAt: Date;
	updatedAt: Date | null;
	frameId: string;
	status: "online" | "offline" | "syncing" | null;
	lastSync?: string;
	currentImage?: string;
};
