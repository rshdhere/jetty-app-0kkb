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

      <section className="mt-8 grid w-full max-w-[420px] gap-3 text-sm text-white/90 sm:grid-cols-3">
        <div className="rounded-xl bg-white/10 px-3 py-3 backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
            Flap
          </p>
          <p className="mt-1 leading-snug">Space, ↑, or tap the playfield</p>
        </div>
        <div className="rounded-xl bg-white/10 px-3 py-3 backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
            Score
          </p>
          <p className="mt-1 leading-snug">Clear each pipe gap to earn a point</p>
        </div>
        <div className="rounded-xl bg-white/10 px-3 py-3 backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
            Survive
          </p>
          <p className="mt-1 leading-snug">Pipes speed up as your score climbs</p>
        </div>
      </section>

      <footer className="mt-6 text-center text-xs text-white/60">
        High score is saved in this browser
      </footer>
    </main>
  );
}
