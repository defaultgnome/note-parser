import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/features/sidebar/app-sidebar";
import { cookies } from "next/headers";
import { SidebarPageHeader } from "~/features/sidebar/sidebar-page-header";
import { ThemeProvider } from "~/features/theme/theme-provider";

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
              <main className="w-full p-4">
                <SidebarPageHeader />
                {children}
              </main>
            </SidebarProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
