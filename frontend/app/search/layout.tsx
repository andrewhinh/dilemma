import type { Metadata } from "next";
import { MainNav } from "../ui/Nav";

export const metadata: Metadata = {
  title: "Search",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainNav />
      {children}
    </>
  );
}
