import { ApertureIcon } from "@phosphor-icons/react/dist/ssr/Aperture";
import { LoginForm } from "@/app/components/login-form"
import PasskeyConditionalUI from "./passkey-conditional-ui";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <PasskeyConditionalUI />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ApertureIcon className="size-6" />
          </div>
          Domino Frame
        </a>
        <LoginForm />
      </div>
    </div>
  )
}

