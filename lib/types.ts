export type Frame = {
	id: number;
	title: string;
	location: string;
	model: string;
	createdAt: Date;
	updatedAt: Date | null;
	frameId: string;
	status: "online" | "offline" | "syncing" | null;
	lastSeenAt: Date | null;
	uptimeSeconds: number | null;
	storageTotalBytes: number | null;
	storageAvailableBytes: number | null;
	activeImage: string | null;
	lastSync?: string;
	currentImage?: string;
};
