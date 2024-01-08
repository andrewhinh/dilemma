import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileProvider } from "../providers";

import { LoggedInNav, LoggedOutNav } from "../../ui/Nav";

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
      <Suspense fallback={<LoggedOutNav />}>
        <LoggedInNav />
      </Suspense>
      {children}
    </ProfileProvider>
  );
}
