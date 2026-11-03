import Hero from "./Hero";
import Title from "./Title";
import SmoothScroll from "./SmoothScroll";
import Story from "./Story";
import Principles from "./Principles";


export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[#080808] text-[#ede7dc] overflow-visible selection:bg-[#d9a544]/25 selection:text-[#d9a544]">
      <SmoothScroll />
      <Hero />
      <Title />
      <Story />
      <Principles />

    </main>
  );
}
