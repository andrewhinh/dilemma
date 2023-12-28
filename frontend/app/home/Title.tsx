import Header from "../ui/Header";

function Title() {
  return (
    <Header>
      {
        // Change steps of typewriter effect if text is changed
      }
      <h1 className="p-2 text-4xl md:text-6xl typewriter-effect-title">
        Play to Learn
      </h1>
      <h2 className="text-md md:text-2xl typewriter-effect-subtitle">
        A multiplayer learning platform
      </h2>
    </Header>
  );
}

export default Title;
