import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConstProvider from "./providers";
import Footer from "./(util)/ui/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Project",
    default: "Project",
  },
  description: "Full-Stack Project Template",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "")
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ConstProvider>
          {children}
          <Footer />
        </ConstProvider>
      </body>
    </html>
  );
}
