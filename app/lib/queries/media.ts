"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileObject } from "@/app/lib/r2";

export type MediaFile = FileObject & {
	type?: string;
};

export type UploadUrlResponse = {
	uploadUrl: string;
	key: string;
	contentType: string;
	fileUrl: string;
};

export type UploadFileData = {
	file: File;
	key: string;
};

export type UploadWithPresignedUrlData = {
	file: File;
	key: string;
};

export function useMedia(prefix: string = "") {
	return useQuery({
		queryKey: ["media", prefix],
		queryFn: async (): Promise<MediaFile[]> => {
			const url = new URL("/api/media", window.location.origin);
			if (prefix) {
				url.searchParams.set("prefix", prefix);
			}

			const response = await fetch(url.toString());
			if (!response.ok) {
				throw new Error("Failed to fetch media files");
			}
			return response.json();
		},
	});
}

export function useUploadMedia() {
	const queryClient = useQueryClient();

	return useMutation({
		retry: 3,
		mutationFn: async ({ file, key }: UploadFileData): Promise<MediaFile> => {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("key", key);

			const response = await fetch("/api/media", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to upload file");
			}

			return response.json();
		},
		onSuccess: (newFile, variables) => {
			queryClient.setQueryData(
				["media", ""],
				(old: MediaFile[] | undefined) => {
					return old ? [newFile, ...old] : [newFile];
				},
			);

			const prefix = variables.key?.split("/")[0] || "uploads";
			queryClient.setQueryData(
				["media", prefix],
				(old: MediaFile[] | undefined) => {
					return old ? [newFile, ...old] : [newFile];
				},
			);

			queryClient.invalidateQueries({ queryKey: ["media"] });
		},
		onError: (error) => {
			console.log("Error uploading file:", error);
		},
	});
}

export function useGetUploadUrl() {
	return useMutation({
		mutationFn: async ({
			key,
			contentType,
		}: {
			key: string;
			contentType: string;
		}): Promise<UploadUrlResponse> => {
			const response = await fetch("/api/media/upload-url", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ key, contentType }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to get upload URL");
			}

			return response.json();
		},
	});
}

export function useUploadWithPresignedUrl() {
	const queryClient = useQueryClient();
	const getUploadUrl = useGetUploadUrl();

	return useMutation({
		mutationFn: async ({
			file,
			key,
		}: UploadWithPresignedUrlData): Promise<MediaFile> => {
			const fileKey = key || `uploads/${Date.now()}-${file.name}`;

			const { uploadUrl, fileUrl } = await getUploadUrl.mutateAsync({
				key: fileKey,
				contentType: file.type,
			});

			const uploadResponse = await fetch(uploadUrl, {
				method: "PUT",
				body: file,
				headers: {
					"Content-Type": file.type,
				},
			});

			if (!uploadResponse.ok) {
				throw new Error("Failed to upload file to storage");
			}

			return {
				key: fileKey,
				name: file.name,
				url: fileUrl,
				size: file.size,
				lastmodified: new Date(),
				etag: uploadResponse.headers.get("etag") || "",
				type: file.type,
			};
		},
		onSuccess: (newFile, variables) => {
			queryClient.setQueryData(
				["media", ""],
				(old: MediaFile[] | undefined) => {
					return old ? [newFile, ...old] : [newFile];
				},
			);

			const prefix = variables.key?.split("/")[0] || "uploads";
			queryClient.setQueryData(
				["media", prefix],
				(old: MediaFile[] | undefined) => {
					return old ? [newFile, ...old] : [newFile];
				},
			);

			queryClient.invalidateQueries({ queryKey: ["media"] });
		},
	});
}

export function useDeleteMedia() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (key: string): Promise<void> => {
			const encodedKey = encodeURIComponent(key);
			const response = await fetch(`/api/media/${encodedKey}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete file");
			}
		},
		onSuccess: (_, deletedKey) => {
			queryClient.setQueryData(
				["media", ""],
				(old: MediaFile[] | undefined) => {
					return old?.filter((file) => file.key !== deletedKey);
				},
			);

			const prefix = deletedKey.split("/")[0];
			queryClient.setQueryData(
				["media", prefix],
				(old: MediaFile[] | undefined) => {
					return old?.filter((file) => file.key !== deletedKey);
				},
			);

			queryClient.invalidateQueries({ queryKey: ["media"] });
		},
	});
}

export function useGetDownloadUrl() {
	return useMutation({
		mutationFn: async (key: string): Promise<string> => {
			const encodedKey = encodeURIComponent(key);
			const response = await fetch(`/api/media/${encodedKey}?action=download`);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to get download URL");
			}

			const { url } = await response.json();
			return url;
		},
	});
}

export function useMediaQueryData(prefix: string = "") {
	const queryClient = useQueryClient();
	return queryClient.getQueryData<MediaFile[]>(["media", prefix]);
}

export function useBulkDeleteMedia() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (keys: string[]): Promise<void> => {
			const deletePromises = keys.map((key) => {
				const encodedKey = encodeURIComponent(key);
				return fetch(`/api/media/${encodedKey}`, { method: "DELETE" });
			});

			const responses = await Promise.all(deletePromises);

			const failed = responses.filter((response) => !response.ok);
			if (failed.length > 0) {
				throw new Error(`Failed to delete ${failed.length} files`);
			}
		},
		onSuccess: (_, deletedKeys) => {
			queryClient.setQueryData(
				["media", ""],
				(old: MediaFile[] | undefined) => {
					return old?.filter((file) => !deletedKeys.includes(file.key));
				},
			);

			queryClient.invalidateQueries({ queryKey: ["media"] });
		},
	});
}
