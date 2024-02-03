import { AuthNav } from "../ui/Nav";
import Main from "../ui/Main";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthNav />
      <Main className="gap-6 md:gap-12">{children}</Main>
    </>
  );
}
