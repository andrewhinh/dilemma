import Main from "../ui/Main";
import Title from "./Title";
import Upload from "./Upload";

function HomePage() {
  return (
    <Main className="gap-12 md:gap-24">
      <Title />
      <Upload />
    </Main>
  );
}

export default HomePage;
