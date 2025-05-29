import { FrameCornersIcon } from "@phosphor-icons/react/dist/ssr/FrameCorners";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";

import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // console.log('SESSION', session)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video flex flex-col justify-between relative rounded-xl bg-muted/50 overflow-hidden p-5">
          <FrameCornersIcon size={192} className="absolute -top-2 -right-10 rotate-10 text-muted-foreground/20" />
          <div className="text-gray-600 text-8xl">5</div>
          <div className="text-gray-600 text-2xl">Frames</div>
        </div>
        <div className="aspect-video flex flex-col justify-between relative rounded-xl bg-muted/50 overflow-hidden p-5">
          <ImageIcon size={192} className="absolute -top-2 -right-10 rotate-10 text-muted-foreground/15" />
          <div className="text-gray-600 text-8xl">32</div>
          <div className="text-gray-600 text-2xl">Images</div>
        </div>
        <div className="aspect-video flex flex-col justify-between relative rounded-xl bg-muted/50 overflow-hidden p-5" />
      </div >
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
        {session ? (
          <div>
            <pre className="text-sm text-gray-500 wrap">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        ) : null}
      </div >
    </div >
  );
}
