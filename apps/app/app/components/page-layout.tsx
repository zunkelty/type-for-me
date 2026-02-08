import { type CSSProperties, type PointerEvent, ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "./ui/sidebar";
import { href, Link, useLocation } from "react-router";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Bot, House } from "lucide-react";

interface PageLayoutProps {
  children: ReactNode;
}

const TITLEBAR_HEIGHT = "44px";

export default function PageLayout({ children }: PageLayoutProps) {
  const location = useLocation();

  const handleTitlebarPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    getCurrentWindow().startDragging();
  };

  return (
    <SidebarProvider
      className="min-h-svh pt-(--app-titlebar-height)"
      style={{ "--app-titlebar-height": TITLEBAR_HEIGHT } as CSSProperties}
    >
      <header
        aria-hidden
        data-tauri-drag-region=""
        onPointerDown={handleTitlebarPointerDown}
        className="titlebar-drag-region select-none cursor-default fixed inset-x-0 top-0 z-30 h-(--app-titlebar-height)"
      />

      <Sidebar variant="inset" className="pt-(--app-titlebar-height)">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <Link to={href("/")}>
                  <img src="/icon-1024x1024.png" className="h-full" />
                  <span className="text-lg font-medium font-geist-sans -tracking-wide">
                    type for me
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === href("/")}
                    asChild
                  >
                    <Link
                      to={href("/")}
                      className="font-sans flex gap-2 items-center"
                    >
                      <House className="size-5" />
                      Home
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === href("/settings")}
                    asChild
                  >
                    <Link
                      to={href("/settings")}
                      className="font-sans flex gap-2 items-center"
                    >
                      <Bot className="size-5" />
                      Settings
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
