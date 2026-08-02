import { LoginForm } from "@/components/login-form";
import Image from "next/image";
import Logo from "../icon.png";
import PasskeyConditionalUI from "./passkey-conditional-ui";

export default function LoginPage() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 py-[max(1.5rem,env(safe-area-inset-top))] md:p-10">
			<PasskeyConditionalUI />
			<div className="flex w-full max-w-sm flex-col gap-6">
				<div className="flex items-end justify-start gap-2 font-medium">
					<div className="flex items-center justify-center rounded-md bg-primary text-primary-foreground">
						<Image alt="" width={56} height={56} src={Logo} priority />
					</div>
					<h1 className="text-5xl font-light tracking-tighter" translate="no">
						<strong className="font-semibold">Domino</strong> Frame
					</h1>
				</div>
				<LoginForm />
			</div>
		</div>
	);
}
