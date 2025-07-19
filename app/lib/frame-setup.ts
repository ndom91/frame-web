export const BLE_CONFIG = {
	SERVICE_UUID: "c63dc91d-efa5-43f2-9e26-7d30ae8eb4fc",
	CHARACTERISTICS: {
		WIFI_CREDENTIALS: "12345678-1234-1234-1234-123456789001",
		FRAME_CONFIG: "12345678-1234-1234-1234-123456789002",
		COMMAND: "12345678-1234-1234-1234-123456789004",
	},
};

export interface WiFiCredentials {
	ssid: string;
	password: string;
}

export interface FrameConfig {
	name: string;
	s3_bucket: string;
}

export type SetupCommand = "complete_setup" | "test_wifi" | "reset";

export interface PhotoFrameSetup {
	setWiFiCredentials(credentials: WiFiCredentials): Promise<void>;
	setFrameConfig(config: FrameConfig): Promise<void>;
	sendCommand(command: SetupCommand): Promise<void>;
}
