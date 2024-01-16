import type { Metadata } from "next";
import { ProfileProvider } from "../providers";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider>
      {children}
    </ProfileProvider>
  );
}
