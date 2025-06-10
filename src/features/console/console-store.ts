import { create } from "zustand";

interface ConsoleStore {
  logs: {
    message: string;
    type: "info" | "error" | "warning" | "success";
  }[];
  info: (log: string) => void;
  error: (log: string) => void;
  warning: (log: string) => void;
  success: (log: string) => void;
  clearLogs: () => void;
}

export const useConsoleStore = create<ConsoleStore>((set) => ({
  logs: [],
  info: (log: string) =>
    set((state) => ({ logs: [...state.logs, { message: log, type: "info" }] })),
  error: (log: string) =>
    set((state) => ({
      logs: [...state.logs, { message: log, type: "error" }],
    })),
  warning: (log: string) =>
    set((state) => ({
      logs: [...state.logs, { message: log, type: "warning" }],
    })),
  success: (log: string) =>
    set((state) => ({
      logs: [...state.logs, { message: log, type: "success" }],
    })),
  clearLogs: () => set({ logs: [] }),
}));
