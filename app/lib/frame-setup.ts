// BLE Service and Characteristic UUIDs
export const BLE_CONFIG = {
  SERVICE_UUID: "12345678-1234-1234-1234-123456789abc",
  CHARACTERISTICS: {
    WIFI_CREDENTIALS: "12345678-1234-1234-1234-123456789001",
    FRAME_CONFIG: "12345678-1234-1234-1234-123456789002",
    COMMAND: "12345678-1234-1234-1234-123456789004"
  }
};

// Step 1: WiFi Credentials (sent to WiFiCredentialsUUID)
export interface WiFiCredentials {
  ssid: string;     // WiFi network name
  password: string; // WiFi password
}

// Step 2: Frame Configuration (sent to FrameConfigUUID) 
export interface FrameConfig {
  name: string;         // User-friendly name for the frame
  frame_id: string;     // Unique identifier (can be auto-generated frame_id from device)
  api_endpoint: string; // Your backend API URL
  s3_bucket: string;    // S3 bucket name for images
}

// Step 3: Commands (sent to CommandUUID)
export type SetupCommand =
  | "complete_setup"  // Finalize setup and switch to normal mode
  | "test_wifi"       // Test WiFi connection without completing setup
  | "reset";          // Reset all configuration data

// Status responses (read from SetupStatusUUID)
export interface SetupStatus {
  message: string;              // Human-readable status
  wifi_received: boolean;       // Whether WiFi creds were received
  config_received: boolean;     // Whether frame config was received
  setup_complete: boolean;      // Whether setup is finished
}

// Complete setup flow interface
export interface PhotoFrameSetup {
  // Step 1: Send WiFi credentials
  setWiFiCredentials(credentials: WiFiCredentials): Promise<void>;

  // Step 2: Send frame configuration  
  setFrameConfig(config: FrameConfig): Promise<void>;

  // Step 3: Execute command
  sendCommand(command: SetupCommand): Promise<void>;
}
