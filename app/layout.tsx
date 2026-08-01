// v0.0.01 salah

import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Sora } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ArrowBigLeft, Copy } from "lucide-react";
import { ConfettiProvider } from "@/components/providers/confetti-provider";
import { SessionTimeTracker } from "@/components/providers/session-time-tracker";
import { Banner } from "@/components/bannerimp";
import { Suspense } from "react";
import Loading from "@/components/loading";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Sora({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CamBright | Free & Accessible Platform for Mathematics & Science",
  description:
    "CamBright is a free & accessible platform for Mathematics and Science, and other subjects — courses, past papers, flashcards and study tools, all at zero cost.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      // publishableKey={clerkPubKey}
    >
      <html lang="en">
        <head>
          {/* Warm up the connection to Google Drive ahead of time so every
              embedded course video / PDF (rendered as an iframe pointed at
              drive.google.com) skips the DNS + TLS handshake latency on
              first load and starts noticeably faster. */}
          <link rel="preconnect" href="https://drive.google.com" />
          <link rel="preconnect" href="https://docs.google.com" crossOrigin="" />
          <link rel="preconnect" href="https://drive.usercontent.google.com" />
          <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="" />
          <link rel="preconnect" href="https://ssl.gstatic.com" crossOrigin="" />
          <link rel="preconnect" href="https://accounts.google.com" />
          <link rel="preconnect" href="https://apis.google.com" />
          <link rel="dns-prefetch" href="https://drive.google.com" />
          <link rel="dns-prefetch" href="https://drive.usercontent.google.com" />
          <link rel="dns-prefetch" href="https://www.gstatic.com" />
        </head>
        <body className={inter.className} suppressHydrationWarning={true}>
          {/* <ContextMenu> */}
          {/* <ContextMenuTrigger> */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            storageKey="cambright-theme"
            // enableSystem
            // disableTransitionOnChange
          >
            <Suspense>
              <ConfettiProvider />
              <ToastProvider />
              <SessionTimeTracker />
              {/* <Banner
              label="Site is still under development. Features are still being worked on!"
              variant={"development"}
            />{" "} */}
              <QueryProvider>
                {children}
              </QueryProvider>
            </Suspense>
          </ThemeProvider>
          {/* </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>
                <ArrowBigLeft /> {"  "}Back
              </ContextMenuItem>
              <ContextMenuItem>
                <Copy className="mr-2" /> {"  "}Copy
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
