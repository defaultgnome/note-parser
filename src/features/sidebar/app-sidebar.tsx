import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "~/components/ui/sidebar";
import { FileUp, Sparkles, ChartSpline, Database } from "lucide-react";
import { DarkModeSwitch } from "../theme/dark-mode-switch";
import Link from "next/link";

const items = [
  {
    title: "Import",
    url: "/import",
    icon: FileUp,
  },
  {
    title: "Enrich",
    url: "/enrich",
    icon: Sparkles,
  },
  {
    title: "Database",
    url: "/database",
    icon: Database,
  },
  {
    title: "Analyze",
    url: "/analyze",
    icon: ChartSpline,
  },
];
export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/">
          <h1 className="text-xl font-bold">Note Parser</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <DarkModeSwitch />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
