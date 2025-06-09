import { useEffect } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function FindDevice() {
  useEffect(() => {
    async function getBleDevice() {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'PhotoFrame-Setup' }],
        optionalServices: ['12345678-1234-1234-1234-123456789abc']
      });

      console.log('BLE.DEVICE', device)
    }

    getBleDevice()
  }, [])
  return (
    <div className="">
      <div className="grid gap-2">
        <Label htmlFor="name">Frame Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="My Frame"
          required
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="wifi-ssid">WiFi SSID</Label>
        </div>
        <Input id="wifi-ssid" type="text" required />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="wifi-password">WiFi Password</Label>
        </div>
        <Input id="wifi-password" type="password" required />
      </div>
    </div>
  )
}
