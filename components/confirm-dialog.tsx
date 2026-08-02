"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Confirmation step for destructive actions, which previously fired
 * immediately with no prompt and no undo.
 */
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	cancelLabel = "Cancel",
	pending = false,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel: string;
	cancelLabel?: string;
	pending?: boolean;
	onConfirm: () => void | Promise<void>;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
					<AlertDialogAction
						disabled={pending}
						className={cn(buttonVariants({ variant: "destructive" }))}
						onClick={(event) => {
							// Keep the dialog up while the request is in flight, so the
							// pending state is visible instead of the UI snapping shut.
							event.preventDefault();
							void Promise.resolve(onConfirm()).then(() => onOpenChange(false));
						}}
					>
						{pending ? "Removing…" : confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
