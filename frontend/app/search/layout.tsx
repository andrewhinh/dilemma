import type { Metadata } from "next";
import { MainNav } from "../ui/Nav";
import Support from "../home/Support";

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
      <Support />
    </>
  );
}
