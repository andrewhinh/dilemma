import type { Metadata } from "next";
import { AccountProvider } from "./providers";
import { LoggedInNav } from "../ui/Nav";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountProvider>
      <LoggedInNav />
      {children}
    </AccountProvider>
  );
}
