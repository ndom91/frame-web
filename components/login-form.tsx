"use client";

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

export function LoginForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const router = useRouter();
	const signInSocial = async (provider: "google" | "github") => {
		await signIn.social({
			provider: provider,
			callbackURL: "/",
			newUserCallbackURL: "/?new-user=true",
		});
	};

	const signInPasskey = async () => {
		const data = await signIn.passkey();
		console.log("PASSKEY.DATA", data);
		if (data?.error) {
			toast.error("Error signing in with Passkey, please try again");
			return;
		}
		router.push("/");
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>
						Choose a provider to login with below.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form>
						<div className="flex flex-col gap-2">
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() => signInSocial("google")}
							>
								Login with Google
							</Button>
							<Button
								type="button"
								className="w-full"
								onClick={() => signInSocial("github")}
							>
								Login with GitHub
							</Button>
							{typeof window !== "undefined" && window.PublicKeyCredential && (
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={() => signInPasskey()}
								>
									Login with Passkey
								</Button>
							)}
						</div>
						{/* <div className="mt-4 text-center text-sm"> */}
						{/* 	Don&apos;t have an account?{" "} */}
						{/* 	<a href="#" className="underline underline-offset-4"> */}
						{/* 		Sign up */}
						{/* 	</a> */}
						{/* </div> */}
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
