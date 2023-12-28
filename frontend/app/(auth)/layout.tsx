import AuthNav from "./AuthNav";
import Main from "../ui/Main";
import Title from "./Title";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthNav />
      <Main className="gap-6 md:gap-12">
        <Title />
        {children}
      </Main>
    </>
  );
}
