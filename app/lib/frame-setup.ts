export const BLE_CONFIG = {
  SERVICE_UUID: "c63dc91d-efa5-43f2-9e26-7d30ae8eb4fc",
  CHARACTERISTICS: {
    WIFI_CREDENTIALS: "12345678-1234-1234-1234-123456789001",
    FRAME_CONFIG: "12345678-1234-1234-1234-123456789002",
    COMMAND: "12345678-1234-1234-1234-123456789004"
  }
};

export interface WiFiCredentials {
  ssid: string;     // WiFi network name
  password: string; // WiFi password
}

export interface FrameConfig {
  name: string;         // User-friendly name for the frame
  s3_bucket: string;    // S3 bucket name for images
}

export type SetupCommand =
  | "complete_setup"  // Finalize setup and switch to normal mode
  | "test_wifi"       // Test WiFi connection without completing setup
  | "reset";          // Reset all configuration data

export interface PhotoFrameSetup {
  // Step 1: Send WiFi credentials
  setWiFiCredentials(credentials: WiFiCredentials): Promise<void>;

  // Step 2: Send frame configuration  
  setFrameConfig(config: FrameConfig): Promise<void>;

  // Step 3: Execute command
  sendCommand(command: SetupCommand): Promise<void>;
}
