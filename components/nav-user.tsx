"use client";

import { SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";
import { CreditCardIcon } from "@phosphor-icons/react/dist/ssr/CreditCard";
import { CaretUpDownIcon } from "@phosphor-icons/react/dist/ssr/CaretUpDown";
import { BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { SealCheckIcon } from "@phosphor-icons/react/dist/ssr/SealCheck";
import { SunDimIcon } from "@phosphor-icons/react/dist/ssr/SunDim";
import { MoonIcon } from "@phosphor-icons/react/dist/ssr/Moon";
import { DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/** Falls back to the first letter of the email when there's no usable name. */
function getInitials(name: string, email: string) {
	const source = name.trim() || email.trim();
	if (!source) return "?";

	const parts = source.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
	}

	return source.slice(0, 2).toUpperCase();
}

export function NavUser({
	user,
}: {
	user: {
		name: string;
		email: string;
		image?: string | null | undefined;
	};
}) {
	const { isMobile } = useSidebar();
	const { theme, setTheme } = useTheme();
	const router = useRouter();

	const initials = getInitials(user.name, user.email);

	const logOut = async () => {
		try {
			await signOut({
				fetchOptions: {
					onSuccess: () => {
						router.push("/login");
					},
				},
			});
		} catch (error) {
			console.error("Sign out failed", error);
			toast.error("Couldn't log out", {
				description: "Check your connection and try again.",
			});
		}
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.image ?? ""} alt="" />
								<AvatarFallback className="rounded-lg">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<CaretUpDownIcon aria-hidden="true" className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={user.image ?? ""} alt="" />
									<AvatarFallback className="rounded-lg">
										{initials}
									</AvatarFallback>
								</Avatar>
								<div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
							Theme
						</DropdownMenuLabel>
						{/* Radio items rather than buttons inside a label, so the options are
						    real menu items and reachable by keyboard menu navigation. */}
						<DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
							<DropdownMenuRadioItem value="light">
								<SunDimIcon aria-hidden="true" />
								Light
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="dark">
								<MoonIcon aria-hidden="true" />
								Dark
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="system">
								<DesktopIcon aria-hidden="true" />
								System
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							{/* Not built yet — disabled rather than silently doing nothing. */}
							<DropdownMenuItem disabled>
								<SealCheckIcon aria-hidden="true" />
								Account
								<span className="text-muted-foreground ml-auto text-xs">
									Soon
								</span>
							</DropdownMenuItem>
							<DropdownMenuItem disabled>
								<CreditCardIcon aria-hidden="true" />
								Billing
								<span className="text-muted-foreground ml-auto text-xs">
									Soon
								</span>
							</DropdownMenuItem>
							<DropdownMenuItem disabled>
								<BellIcon aria-hidden="true" />
								Notifications
								<span className="text-muted-foreground ml-auto text-xs">
									Soon
								</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={logOut}>
							<SignOutIcon aria-hidden="true" />
							Log Out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
