"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { signIn } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Provider = "google" | "github" | "passkey";

export function LoginForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const router = useRouter();
	const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);

	// Reading `window.PublicKeyCredential` during render would make the server
	// (no window, button absent) and the client (button present) disagree, so the
	// capability check runs after mount instead.
	const [supportsPasskeys, setSupportsPasskeys] = useState(false);

	useEffect(() => {
		setSupportsPasskeys(typeof window.PublicKeyCredential !== "undefined");
	}, []);

	const signInSocial = async (provider: "google" | "github") => {
		setPendingProvider(provider);
		try {
			await signIn.social({
				provider,
				callbackURL: "/",
				newUserCallbackURL: "/?new-user=true",
			});
		} catch (error) {
			console.error(`Sign in with ${provider} failed`, error);
			toast.error(`Couldn't sign in with ${provider}`, {
				description: "Check your connection and try again.",
			});
			setPendingProvider(null);
		}
	};

	const signInPasskey = async () => {
		setPendingProvider("passkey");
		try {
			const data = await signIn.passkey();
			if (data?.error) {
				toast.error("Couldn't sign in with your passkey", {
					description: "Try again, or use Google or GitHub instead.",
				});
				return;
			}
			router.push("/");
		} catch (error) {
			console.error("Passkey sign in failed", error);
			toast.error("Couldn't sign in with your passkey", {
				description: "Try again, or use Google or GitHub instead.",
			});
		} finally {
			setPendingProvider(null);
		}
	};

	const isPending = pendingProvider !== null;

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Log In</CardTitle>
					<CardDescription>
						Choose a provider to log in with below.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-2">
						<Button
							type="button"
							variant="outline"
							className="w-full"
							disabled={isPending}
							onClick={() => signInSocial("google")}
						>
							{pendingProvider === "google"
								? "Redirecting…"
								: "Continue with Google"}
						</Button>
						<Button
							type="button"
							className="w-full"
							disabled={isPending}
							onClick={() => signInSocial("github")}
						>
							{pendingProvider === "github"
								? "Redirecting…"
								: "Continue with GitHub"}
						</Button>
						{process.env.NEXT_PUBLIC_PASSKEY_ENABLED === "true" &&
							supportsPasskeys && (
								<Button
									type="button"
									variant="outline"
									className="w-full"
									disabled={isPending}
									onClick={signInPasskey}
								>
									{pendingProvider === "passkey"
										? "Waiting for passkey…"
										: "Continue with Passkey"}
								</Button>
							)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
