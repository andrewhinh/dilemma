import type { Metadata } from "next";
import { AccountProvider } from "./providers";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountProvider>{children}</AccountProvider>;
}
