export interface ResizeOptions {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
	format?: "jpeg" | "webp";
}

export async function resizeImage(
	file: File,
	options: ResizeOptions = {},
): Promise<File> {
	const {
		maxWidth = 1920,
		maxHeight = 1080,
		quality = 0.85,
		format = "jpeg",
	} = options;

	return new Promise((resolve, reject) => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();

		if (!ctx) {
			reject(new Error("Unable to get canvas context"));
			return;
		}

		img.onload = () => {
			let { width, height } = img;

			if (width > maxWidth || height > maxHeight) {
				const ratio = Math.min(maxWidth / width, maxHeight / height);
				width *= ratio;
				height *= ratio;
			}

			canvas.width = width;
			canvas.height = height;

			ctx.drawImage(img, 0, 0, width, height);

			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error("Failed to create blob"));
						return;
					}

					const extension = format === "jpeg" ? "jpg" : format;
					const originalName = file.name;
					const nameWithoutExt =
						originalName.substring(0, originalName.lastIndexOf(".")) ||
						originalName;
					const newName = `${nameWithoutExt}.${extension}`;

					const resizedFile = new File([blob], newName, {
						type: `image/${format}`,
						lastModified: Date.now(),
					});

					resolve(resizedFile);
				},
				`image/${format}`,
				quality,
			);
		};

		img.onerror = () => {
			reject(new Error("Failed to load image"));
		};

		// Create object URL from file
		img.src = URL.createObjectURL(file);
	});
}

export function getImageDimensions(
	file: File,
): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();

		img.onload = () => {
			resolve({ width: img.width, height: img.height });
			URL.revokeObjectURL(img.src);
		};

		img.onerror = () => {
			reject(new Error("Failed to load image"));
			URL.revokeObjectURL(img.src);
		};

		img.src = URL.createObjectURL(file);
	});
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

