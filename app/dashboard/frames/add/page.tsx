import { Metadata } from "next";
import { FindDevice } from "./find-device";

export const metadata: Metadata = {
  title: "Domino Frame - Frame",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-2xl">Add Frame</h1>
      <FindDevice />
    </div>
  )
}
