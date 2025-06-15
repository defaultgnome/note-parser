import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/features/sidebar/app-sidebar";
import { cookies } from "next/headers";
import { SidebarPageHeader } from "~/features/sidebar/sidebar-page-header";
import { ThemeProvider } from "~/features/theme/theme-provider";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: "Note Parser",
  description: "Transform your Semi-Structured Notes into a Database",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const sidebarDefaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider defaultOpen={sidebarDefaultOpen}>
              <AppSidebar />
              <div className="flex w-full flex-col p-4">
                <SidebarPageHeader />
                <main className="flex-1 p-4">{children}</main>
                <footer className="mt-12 text-xs text-muted-foreground text-center w-full">
                  &copy; {CURRENT_YEAR} Note Parser. All rights reserved.
                </footer>
              </div>
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
const CURRENT_YEAR = new Date().getFullYear();
