import { Metadata } from "next";
import FileManager from '@/app/dashboard/media/view/file-manager'

export const metadata: Metadata = {
  title: "Domino Frame - Media",
};

export default async function Page() {
  return (
    <div>
      <FileManager />
    </div>
  )
}
