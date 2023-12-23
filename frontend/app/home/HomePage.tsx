import RandomGif from "./RandomGif";
import FunFact from "./FunFact";

function HomePage() {
  return (
    <main className="p-8 flex flex-col items-center justify-center gap-4 min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white">
      <header className="p-10">
        <h1 className="text-6xl">Project</h1>
      </header>
      <FunFact />
      <RandomGif />
    </main>
  );
}

export default HomePage;
