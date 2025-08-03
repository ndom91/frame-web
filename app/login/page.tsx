import { LoginForm } from "@/components/login-form";
import Image from "next/image";
import Logo from "../../components/logo.png";
import PasskeyConditionalUI from "./passkey-conditional-ui";

export default function LoginPage() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<PasskeyConditionalUI />
			<div className="flex w-full max-w-sm flex-col gap-6">
				<a href="#" className="flex items-end gap-2 justify-start font-medium">
					<div className="flex items-center justify-center rounded-md bg-primary text-primary-foreground">
						<Image alt="Domino-Frame Logo" width={56} height={56} src={Logo} />
					</div>
					<span className="text-5xl font-light tracking-tighter">
						<strong className="font-semibold">Domino</strong> Frame
					</span>
				</a>
				<LoginForm />
			</div>
		</div>
	);
}
