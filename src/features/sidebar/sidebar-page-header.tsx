"use client";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Console } from "../console/console";
import { usePathname } from "next/navigation";

export function SidebarPageHeader() {
  const pathname = usePathname();
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <p className="text-muted-foreground text-sm">
          {pathToTitleMap[pathname as keyof typeof pathToTitleMap] || ""}
        </p>
      </div>
      <div>
        <Console />
      </div>
    </div>
  );
}

const pathToTitleMap = {
  "/": "Home",
  "/import": "Import",
  "/enrich": "Enrich",
  "/analyze": "Analyze",
  "/database": "Database",
};
