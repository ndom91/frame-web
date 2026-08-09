"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type WiFiCredentials,
	type FrameConfig,
	type SetupCommand,
	type PhotoFrameSetup,
	BLE_CONFIG,
} from "@/app/lib/frame-setup";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { wait } from "@/lib/utils";
import { useBluetoothAvailability } from "@/app/lib/use-bluetooth-availability";

export class PhotoFrameSetupClient implements PhotoFrameSetup {
	private device: BluetoothDevice | null = null;
	private service: BluetoothRemoteGATTService | null = null;
	private characteristics: Map<string, BluetoothRemoteGATTCharacteristic> =
		new Map();

	async connect(): Promise<void> {
		this.device = await navigator.bluetooth.requestDevice({
			filters: [{ namePrefix: "DominoFrame-" }],
			optionalServices: [BLE_CONFIG.SERVICE_UUID],
		});

		const server = await this.device.gatt!.connect();
		this.service = await server.getPrimaryService(BLE_CONFIG.SERVICE_UUID);

		for (const [name, uuid] of Object.entries(BLE_CONFIG.CHARACTERISTICS)) {
			const char = await this.service.getCharacteristic(uuid);
			this.characteristics.set(name, char);
		}
	}

	getFrameID(): string {
		const prefix = "DominoFrame-";
		const frameID = this.device?.name?.startsWith(prefix)
			? this.device.name.slice(prefix.length)
			: "";
		if (!frameID) throw new Error("Connected device did not provide a frame ID");
		return frameID;
	}

	async setWiFiCredentials(credentials: WiFiCredentials): Promise<void> {
		const char = this.characteristics.get("WIFI_CREDENTIALS")!;
		const data = new TextEncoder().encode(JSON.stringify(credentials));
		await char.writeValue(data);
	}

	async setFrameConfig(config: FrameConfig): Promise<void> {
		const char = this.characteristics.get("FRAME_CONFIG")!;
		const data = new TextEncoder().encode(JSON.stringify(config));
		await char.writeValue(data);
	}

	async sendCommand(command: SetupCommand): Promise<void> {
		const char = this.characteristics.get("COMMAND")!;
		const data = new TextEncoder().encode(command);
		await char.writeValue(data);
	}
}

async function setupPhotoFrame(
	name: string,
	wifiCredentials: WiFiCredentials,
): Promise<void> {
	const client = new PhotoFrameSetupClient();

	await client.connect();
	toast.success("Connected to frame");
	const registration = await fetch("/api/frames/register", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ title: name, frameId: client.getFrameID() }),
	});
	if (!registration.ok) {
		const { error } = await registration.json();
		throw new Error(error || "Failed to register frame");
	}
	const { apiEndpoint, apiKey } = await registration.json();

	await client.setWiFiCredentials(wifiCredentials);
	toast.info("WiFi credentials sent");
	await wait(1000);

	await client.setFrameConfig({
		name,
		s3_bucket: `https://${process.env.NEXT_PUBLIC_IMAGE_HOSTNAME}`,
		api_endpoint: apiEndpoint,
		api_key: apiKey,
	});
	toast.info("Frame configuration sent");
	await wait(1000);

	await client.sendCommand("test_wifi");
	toast.info("WiFi test initiated");
	await wait(3000);

	await client.sendCommand("complete_setup");

	// TODO: Write Frame to DB
	// TODO: Show BLE Frames in table / list
}

type FieldName = "name" | "ssid" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;

function Notice({
	tone = "muted",
	role = "status",
	children,
}: {
	tone?: "muted" | "destructive";
	role?: "status" | "alert";
	children: React.ReactNode;
}) {
	return (
		<div
			role={role}
			className={
				tone === "destructive"
					? "rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm"
					: "rounded-lg border bg-muted/40 p-3 text-sm"
			}
		>
			{children}
		</div>
	);
}

export function FindDevice() {
	const { availability, recheck } = useBluetoothAvailability();

	const [name, setName] = useState("");
	const [ssid, setSsid] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<FieldErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const fieldRefs = {
		name: useRef<HTMLInputElement>(null),
		ssid: useRef<HTMLInputElement>(null),
		password: useRef<HTMLInputElement>(null),
	};

	const validate = (): FieldErrors => {
		const nextErrors: FieldErrors = {};
		if (!name.trim()) nextErrors.name = "Give the frame a name.";
		if (!ssid.trim()) nextErrors.ssid = "Enter your network name.";
		if (!password) nextErrors.password = "Enter your network password.";
		return nextErrors;
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const nextErrors = validate();
		setErrors(nextErrors);

		const firstInvalid = (["name", "ssid", "password"] as const).find(
			(field) => nextErrors[field],
		);
		if (firstInvalid) {
			fieldRefs[firstInvalid].current?.focus();
			return;
		}

		setIsSubmitting(true);
		try {
			await setupPhotoFrame(name.trim(), { ssid: ssid.trim(), password });
			toast.success("Setup complete", {
				description: `${name.trim()} is configured and connecting to ${ssid.trim()}.`,
			});
		} catch (error) {
			console.error("Frame setup failed", error);
			toast.error("Setup failed", {
				description:
					error instanceof Error
						? `${error.message} Check the frame is powered on and nearby, then try again.`
						: "Check the frame is powered on and nearby, then try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const describedBy = (field: FieldName) =>
		errors[field] ? `${field}-error` : undefined;

	const canSubmit =
		availability === "available" && !isSubmitting;

	return (
		<Card className="h-fit">
			<CardHeader>
				<CardTitle>Frame details</CardTitle>
				<CardDescription>
					Your WiFi details are sent straight to the frame over Bluetooth.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{availability === "checking" && (
					<div
						className="space-y-4"
						role="status"
						aria-label="Checking for Bluetooth…"
					>
						<Skeleton className="h-9 w-full" />
						<Skeleton className="h-9 w-full" />
						<Skeleton className="h-9 w-full" />
					</div>
				)}

				{availability === "unsupported" && (
					<Notice tone="destructive" role="alert">
						<p className="font-medium">
							This browser can&rsquo;t set up a frame
						</p>
						<p className="mt-1 text-muted-foreground">
							Setup needs Web Bluetooth, which Safari and Firefox don&rsquo;t
							support &mdash; including every browser on iPhone and iPad. Open
							this page in Chrome, Edge, Opera, or Samsung Internet to continue.
						</p>
					</Notice>
				)}

				{(availability === "available" || availability === "unavailable") && (
					<div className="space-y-4">
						{availability === "unavailable" && (
							<Notice>
								<p className="font-medium">Bluetooth is turned off</p>
								<p className="mt-1 text-muted-foreground">
									Turn Bluetooth on in your system settings to pair with the
									frame.
								</p>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="mt-2"
									onClick={() => void recheck()}
								>
									Check Again
								</Button>
							</Notice>
						)}

						<form onSubmit={handleSubmit} className="flex flex-col gap-4">
							<div className="grid gap-2">
								<Label htmlFor="frame-name">Frame Name</Label>
								<Input
									ref={fieldRefs.name}
									data-1p-ignore
									id="frame-name"
									name="frameName"
									type="text"
									autoComplete="off"
									spellCheck={false}
									placeholder=""
									value={name}
									aria-invalid={Boolean(errors.name)}
									aria-describedby={describedBy("name")}
									onChange={(e) => setName(e.target.value)}
								/>
								{errors.name && (
									<p id="name-error" className="text-sm text-destructive">
										{errors.name}
									</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="wifi-ssid">WiFi Network</Label>
								<Input
									ref={fieldRefs.ssid}
									data-1p-ignore
									id="wifi-ssid"
									name="wifiSsid"
									type="text"
									autoComplete="off"
									spellCheck={false}
									placeholder=""
									value={ssid}
									aria-invalid={Boolean(errors.ssid)}
									aria-describedby={describedBy("ssid")}
									onChange={(e) => setSsid(e.target.value)}
								/>
								{errors.ssid && (
									<p id="ssid-error" className="text-sm text-destructive">
										{errors.ssid}
									</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="wifi-password">WiFi Password</Label>
								<Input
									ref={fieldRefs.password}
									data-1p-ignore
									id="wifi-password"
									name="wifiPassword"
									type="password"
									autoComplete="off"
									spellCheck={false}
									value={password}
									aria-invalid={Boolean(errors.password)}
									aria-describedby={describedBy("password")}
									onChange={(e) => setPassword(e.target.value)}
								/>
								{errors.password && (
									<p id="password-error" className="text-sm text-destructive">
										{errors.password}
									</p>
								)}
							</div>

							<Button type="submit" disabled={!canSubmit}>
								{isSubmitting ? "Setting up frame…" : "Start Device Setup"}
							</Button>
							<p aria-live="polite" className="sr-only">
								{isSubmitting
									? "Setting up frame, this takes a few seconds."
									: ""}
							</p>
						</form>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
