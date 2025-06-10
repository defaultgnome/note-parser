"use client";

import { Button } from "~/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function DarkModeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex w-full items-center space-x-2">
      <Button
        aria-label="Toggle dark mode"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="w-full"
        variant="outline"
      >
        <div className="flex items-center gap-2 dark:hidden">
          <Sun /> Light Mode
        </div>

        <div className="hidden items-center gap-2 dark:flex">
          <Moon /> Dark Mode
        </div>
      </Button>
    </div>
  );
}
