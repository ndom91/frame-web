"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
	frameConfig: FrameConfig,
	wifiCredentials: WiFiCredentials,
): Promise<void> {
	const client = new PhotoFrameSetupClient();

	// 1. Connect to frame
	await client.connect();
	toast.success("Connected to frame");

	// 2. Send WiFi credentials
	await client.setWiFiCredentials(wifiCredentials);
	toast.info("WiFi credentials sent");

	// 3. Wait a moment for processing
	await wait(1000);

	// 4. Send frame configuration
	await client.setFrameConfig(frameConfig);
	toast.info("Frame configuration sent");

	// 5. Wait a moment for processing
	await wait(1000);

	// 6. Optional: Test WiFi before completing
	await client.sendCommand("test_wifi");
	toast.info("WiFi test initiated");

	// 7. Wait for test completion
	await wait(3000);

	// 8. Complete setup
	await client.sendCommand("complete_setup");

	// TODO: Write Frame to DB
	// TODO: Show BLE Frames in table / list
}

type FieldName = "name" | "ssid" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;

export function FindDevice() {
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

		// Move focus to the first problem so the error isn't only visual.
		const firstInvalid = (["name", "ssid", "password"] as const).find(
			(field) => nextErrors[field],
		);
		if (firstInvalid) {
			fieldRefs[firstInvalid].current?.focus();
			return;
		}

		setIsSubmitting(true);
		try {
			await setupPhotoFrame(
				{
					name: name.trim(),
					s3_bucket: `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.NEXT_PUBLIC_R2_BUCKET}`,
				},
				{ ssid: ssid.trim(), password },
			);
			toast.success("Setup complete", {
				description: `${name.trim()} is configured and connecting to ${ssid.trim()}.`,
			});
		} catch (error) {
			console.error("Frame setup failed", error);
			toast.error("Setup failed", {
				description:
					error instanceof Error
						? `${error.message} Move closer to the frame and try again.`
						: "Move closer to the frame and try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const describedBy = (field: FieldName) =>
		errors[field] ? `${field}-error` : undefined;

	return (
		<form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
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
					placeholder="Living room frame…"
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
					placeholder="MyHomeNetwork…"
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

			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? "Setting up frame…" : "Start Device Setup"}
			</Button>
			<p aria-live="polite" className="sr-only">
				{isSubmitting ? "Setting up frame, this takes a few seconds." : ""}
			</p>
		</form>
	);
}
