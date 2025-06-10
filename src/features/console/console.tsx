"use client";

import { useEffect, useState } from "react";
import { SquareChevronRight } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Toggle } from "~/components/ui/toggle";
import { useConsoleStore } from "./console-store";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

export function Console() {
  const [isOpen, setIsOpen] = useState(false);
  const { logs, clearLogs } = useConsoleStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ";" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        console.log("Console opened");
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Toggle variant="outline">
          <SquareChevronRight />
          <p>Console</p>
        </Toggle>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-5xl">
          <DrawerHeader>
            <DrawerTitle>Console</DrawerTitle>
            <DrawerDescription>
              See all the logs of your current session's activities.
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="bg-muted flex h-[300px] flex-col gap-2 rounded-md border p-4 pb-0 font-mono">
            {[...logs, ...logs, ...logs, ...logs, ...logs, ...logs].map(
              (log, index) => (
                <LogLine key={index} log={log} />
              ),
            )}
            {logs.length === 0 && (
              <p className="text-muted-foreground text-sm">No logs yet.</p>
            )}
          </ScrollArea>
          <DrawerFooter>
            <div className="mx-auto flex w-full max-w-sm flex-1 items-center gap-2">
              <Button
                variant="destructive"
                onClick={clearLogs}
                className="flex-1"
              >
                Clear
              </Button>
              <DrawerClose asChild className="flex-1">
                <Button variant="outline" className="flex-1">
                  Close
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function LogLine({
  log,
}: {
  log: { message: string; type: "info" | "error" | "warning" | "success" };
}) {
  return (
    <div className="flex items-center gap-2">
      <p
        className={cn("text-muted-foreground", {
          "text-blue-500": log.type === "info",
          "text-red-500": log.type === "error",
          "text-yellow-500": log.type === "warning",
          "text-green-500": log.type === "success",
        })}
      >
        [{log.type.toUpperCase()}]
      </p>
      <p className="">{log.message}</p>
    </div>
  );
}
