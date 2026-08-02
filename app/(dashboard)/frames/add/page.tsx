import { Metadata } from "next";
import { BluetoothIcon } from "@phosphor-icons/react/dist/ssr/Bluetooth";
import { PlugIcon } from "@phosphor-icons/react/dist/ssr/Plug";
import { ArrowsInIcon } from "@phosphor-icons/react/dist/ssr/ArrowsIn";

import { FindDevice } from "./find-device";
import { BluetoothSetupIllustration } from "@/components/bluetooth-setup-illustration";

export const metadata: Metadata = {
  title: "Add Frame — Domino Frame",
};

const STEPS = [
  {
    icon: BluetoothIcon,
    title: "Use a device with Bluetooth",
    body: "Pairing happens right here in the browser, so the phone or computer you're on needs Bluetooth switched on. Works in Chrome, Edge, Opera, and Samsung Internet.",
  },
  {
    icon: PlugIcon,
    title: "Power the frame on",
    body: "Plug the frame in and let it finish starting up. Once it's ready it announces itself as DominoFrame-… and waits to be paired.",
  },
  {
    icon: ArrowsInIcon,
    title: "Bring the frame within range",
    body: "Stay within a few metres of the frame while you set it up. Bluetooth range is short, and walls or floors between you will cut it down further.",
  },
];

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-5xl p-4 pt-0">
      <h1 className="text-2xl font-semibold">Add Frame</h1>
      <p className="mt-1 text-muted-foreground">
        Connect a new frame to your WiFi network over Bluetooth.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Instructions first in the DOM, so mobile reads them before the form. */}
        <div>
          <BluetoothSetupIllustration className="max-w-sm" />

          <h2 className="mt-6 text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Before you start
          </h2>
          <ol className="mt-3 space-y-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <step.icon aria-hidden="true" className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium">
                    <span className="text-muted-foreground tabular-nums">
                      {index + 1}.
                    </span>{" "}
                    {step.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <FindDevice />
      </div>
    </div>
  );
}
