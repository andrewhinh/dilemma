import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { ConstProvider } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Dilemma",
    default: "Dilemma",
  },
  description: "Manage real estate easily.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || ""),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-zinc-50 text-zinc-500 flex flex-col min-h-screen`}
      >
        <ConstProvider>{children}</ConstProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
