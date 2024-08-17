import { AuthNav } from "../ui/Nav";
import Main from "../ui/Main";
import Support from "../ui/Support";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthNav />
      <Main className="gap-6 md:gap-12">{children}</Main>
      <Support />
    </>
  );
}
