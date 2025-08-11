import { FrameCornersIcon } from "@phosphor-icons/react/dist/ssr/FrameCorners";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import { VideoIcon } from "@phosphor-icons/react/dist/ssr/Video";
// import RegisterPasskey from "./register-passkey";

import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) redirect("/login");

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			{/* <RegisterPasskey /> */}
			<div className="grid auto-rows-min gap-4 md:grid-cols-3">
				<div className=" flex flex-col justify-between relative rounded-xl bg-muted/50 overflow-hidden p-5">
					<FrameCornersIcon
						size={168}
						className="absolute -top-2 -right-10 rotate-10 text-muted-foreground/20"
					/>
					<div className="text-sidebar-foreground text-8xl">5</div>
					<div className="text-sidebar-foreground/75 text-2xl">Frames</div>
				</div>
				<div className=" flex flex-col justify-between relative rounded-xl bg-muted/50 overflow-hidden p-5">
					<ImageIcon
						size={168}
						className="absolute -top-2 -right-10 rotate-10 text-muted-foreground/15"
					/>
					<div className="text-sidebar-foreground text-8xl">32</div>
					<div className="text-sidebar-foreground/75 text-2xl">Images</div>
				</div>
				<div className=" flex flex-col justify-between relative rounded-xl bg-muted/50 overflow-hidden p-5">
					<VideoIcon
						size={168}
						className="absolute -top-2 -right-10 rotate-10 text-muted-foreground/15"
					/>
					<div className="text-sidebar-foreground text-8xl">2</div>
					<div className="text-sidebar-foreground/75 text-2xl">Videos</div>
				</div>
			</div>
			<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-5">
				{/* {session ? ( */}
				{/* 	<div> */}
				{/* 		<pre className="text-sm text-sidebar-foreground/50 wrap whitespace-pre-wrap"> */}
				{/* 			{JSON.stringify(session, null, 2)} */}
				{/* 		</pre> */}
				{/* 	</div> */}
				{/* ) : null} */}
			</div>
		</div>
	);
}
