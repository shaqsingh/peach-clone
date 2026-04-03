import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import PWARegister from "./PWARegister";
import ActivityTracker from "./ActivityTracker";
import type { Viewport } from "next";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "peach!",
  description: "A self-hostable space for you and your friends.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Peach",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>
        <PWARegister />
        <ActivityTracker />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
