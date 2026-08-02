import { Metadata } from "next";
import { FindDevice } from "./find-device";

export const metadata: Metadata = {
  title: "Add Frame — Domino Frame",
};

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-4 p-4 pt-0">
      <h1 className="text-2xl">Add Frame</h1>
      <FindDevice />
    </div>
  )
}
