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
import { useState } from "react";
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

	try {
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
		toast.info("Setup completed");

		// TODO: Write Frame to DB
		// TODO: Show BLE Frames in table / list
	} catch (error) {
		toast.error("Setup failed", {
			// @ts-expect-error FIX Error Type
			description: error?.message ?? error,
		});
		throw error;
	}
}

export function FindDevice() {
	const [wifiCredentials, setWiFiCredentials] = useState<WiFiCredentials>();
	const [frameConfig, setFrameConfig] = useState<FrameConfig>({
		name: "",
		s3_bucket: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}`,
	});

	function initFrameSetup() {
		if (!wifiCredentials?.ssid || !wifiCredentials?.password) {
			toast.error("Please enter WiFi credentials");
			return;
		}

		setupPhotoFrame(frameConfig, wifiCredentials);
	}

	return (
		<div className="flex flex-col gap-4 w-full">
			<div className="grid gap-2">
				<Label htmlFor="name">Frame Name</Label>
				<Input
					data-1p-ignore
					id="name"
					type="text"
					placeholder="My Frame"
					onChange={(e) => {
						setFrameConfig({ ...frameConfig, name: e.target.value });
					}}
					required
				/>
			</div>
			<div className="grid gap-2">
				<div className="flex items-center">
					<Label htmlFor="wifi-ssid">WiFi SSID</Label>
				</div>
				<Input
					data-1p-ignore
					id="wifi-ssid"
					type="text"
					required
					onChange={(e) => {
						// @ts-expect-error update inline update typings
						setWiFiCredentials({
							...wifiCredentials,
							ssid: e.target.value,
						});
					}}
				/>
			</div>
			<div className="grid gap-2">
				<div className="flex items-center">
					<Label htmlFor="wifi-password">WiFi Password</Label>
				</div>
				<Input
					data-1p-ignore
					id="wifi-password"
					type="password"
					required
					onChange={(e) => {
						// @ts-expect-error update inline update typings
						setWiFiCredentials({
							...wifiCredentials,
							password: e.target.value,
						});
					}}
				/>
			</div>
			<Button onClick={initFrameSetup}>Start Device Setup</Button>
		</div>
	);
}
