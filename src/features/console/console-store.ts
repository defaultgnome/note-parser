import { create } from "zustand";
import { toast } from "sonner";

export type ConsoleLogType = "info" | "error" | "warning" | "success" | "debug";
interface ConsoleStore {
  logs: {
    message: string;
    type: ConsoleLogType;
  }[];
  log: (msg: string, type: ConsoleLogType) => void;
  debug: (msg: string) => void;
  info: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
  success: (msg: string) => void;
  clearLogs: () => void;
}

export const useConsoleStore = create<ConsoleStore>((set, get) => ({
  logs: [],
  log: (msg, type) => {
    switch (type) {
      case "info":
        toast.info(msg);
        break;
      case "error":
        toast.error(msg);
        break;
      case "warning":
        toast.warning(msg);
        break;
      case "success":
        toast.success(msg);
        break;
    }
    return set((state) => ({
      logs: [...state.logs, { message: msg, type: type }],
    }));
  },
  debug: (msg) => get().log(msg, "debug"),
  info: (msg) => get().log(msg, "info"),
  error: (msg) => get().log(msg, "error"),
  warning: (msg) => get().log(msg, "warning"),
  success: (msg) => get().log(msg, "success"),
  clearLogs: () => set({ logs: [] }),
}));
