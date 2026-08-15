import FlappyBird from "@/components/FlappyBird";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center px-4 py-8 sm:py-12">
      <header className="mb-6 text-center sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
          Mini arcade
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-5xl">
          Flappy Bird
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
          Guide the bird through the pipes. Flap to stay airborne — one hit and
          it&apos;s game over.
        </p>
      </header>

      <FlappyBird />

      <footer className="mt-8 text-center text-xs text-white/60">
        Controls: Space / ↑ / tap · High score saved locally
      </footer>
    </main>
  );
}
