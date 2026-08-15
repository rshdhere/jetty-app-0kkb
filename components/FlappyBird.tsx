"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BIRD_SIZE,
  BIRD_X,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_HEIGHT,
  PIPE_GAP,
  PIPE_SPAWN_MS,
  PIPE_WIDTH,
  createInitialState,
  flap,
  restart,
  tick,
  type GameState,
} from "@/lib/game";

const BEST_KEY = "flappy-best-score";

function draw(ctx: CanvasRenderingContext2D, state: GameState) {
  const { width: w, height: h } = ctx.canvas;

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#4ec0ca");
  sky.addColorStop(0.55, "#70c5ce");
  sky.addColorStop(1, "#d5eff4");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  const drift = (state.frame * 0.3) % (w + 120);
  for (const [cx, cy, s] of [
    [80 - drift * 0.2, 90, 1],
    [220 - drift * 0.15, 140, 0.8],
    [340 - drift * 0.25, 70, 1.1],
  ] as const) {
    const x = ((cx % (w + 120)) + w + 120) % (w + 120) - 60;
    ctx.beginPath();
    ctx.ellipse(x, cy, 36 * s, 18 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 28 * s, cy + 4, 28 * s, 14 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 24 * s, cy + 6, 24 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const pipe of state.pipes) {
    const topH = pipe.gapY;
    const bottomY = pipe.gapY + PIPE_GAP;
    const bottomH = h - GROUND_HEIGHT - bottomY;

    const drawPipe = (x: number, y: number, height: number, flip: boolean) => {
      const grad = ctx.createLinearGradient(x, 0, x + PIPE_WIDTH, 0);
      grad.addColorStop(0, "#558022");
      grad.addColorStop(0.35, "#73bf2e");
      grad.addColorStop(0.7, "#8fd63a");
      grad.addColorStop(1, "#4a701c");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, PIPE_WIDTH, height);

      ctx.strokeStyle = "#3d5c18";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, PIPE_WIDTH - 2, height - 2);

      const lipY = flip ? y + height - 22 : y;
      ctx.fillStyle = "#6fb82a";
      ctx.fillRect(x - 4, lipY, PIPE_WIDTH + 8, 22);
      ctx.strokeStyle = "#3d5c18";
      ctx.strokeRect(x - 4, lipY, PIPE_WIDTH + 8, 22);
    };

    drawPipe(pipe.x, 0, topH, true);
    drawPipe(pipe.x, bottomY, bottomH, false);
  }

  ctx.fillStyle = "#ded895";
  ctx.fillRect(0, h - GROUND_HEIGHT, w, GROUND_HEIGHT);
  ctx.fillStyle = "#5e3f1c";
  ctx.fillRect(0, h - GROUND_HEIGHT, w, 8);
  ctx.fillStyle = "#83c043";
  ctx.fillRect(0, h - GROUND_HEIGHT, w, 4);

  const stripeOffset = (state.frame * 2.4) % 28;
  ctx.fillStyle = "#c9bc6e";
  for (let x = -stripeOffset; x < w; x += 28) {
    ctx.fillRect(x, h - GROUND_HEIGHT + 14, 14, GROUND_HEIGHT - 14);
  }

  const bob = state.status === "ready" ? Math.sin(state.frame / 12) * 6 : 0;
  const birdY = state.birdY + bob;
  const angle =
    state.status === "playing"
      ? Math.max(-0.6, Math.min(1.1, state.velocity / 10))
      : 0;

  ctx.save();
  ctx.translate(BIRD_X + BIRD_SIZE / 2, birdY + BIRD_SIZE / 2);
  ctx.rotate(angle);

  ctx.fillStyle = "#f8db49";
  ctx.beginPath();
  ctx.ellipse(0, 0, BIRD_SIZE / 2 + 2, BIRD_SIZE / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a012";
  ctx.lineWidth = 2;
  ctx.stroke();

  const wingFlap = Math.sin(state.frame / 4) * 6;
  ctx.fillStyle = "#f0c419";
  ctx.beginPath();
  ctx.ellipse(-4, wingFlap * 0.3, 10, 7, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(8, -4, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(10, -4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e67e22";
  ctx.beginPath();
  ctx.moveTo(12, 2);
  ctx.lineTo(24, 5);
  ctx.lineTo(12, 10);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  if (state.status === "playing" || state.status === "over") {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.font = "bold 48px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(state.score), w / 2 + 2, 72 + 2);
    ctx.fillStyle = "#fff";
    ctx.fillText(String(state.score), w / 2, 72);
  }
}

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState(0));
  const lastSpawnRef = useRef(0);
  const uiSnapshot = useRef({ status: "ready" as GameState["status"], score: 0, best: 0 });
  const [ui, setUi] = useState({
    status: "ready" as GameState["status"],
    score: 0,
    best: 0,
  });

  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(BEST_KEY) || "0");
      if (!Number.isNaN(stored) && stored > 0) {
        stateRef.current = createInitialState(stored);
        uiSnapshot.current = { status: "ready", score: 0, best: stored };
        setUi({ status: "ready", score: 0, best: stored });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const loop = (now: number) => {
      if (!running) return;
      const prev = stateRef.current;
      const shouldSpawn =
        prev.status === "playing" &&
        (lastSpawnRef.current === 0 || now - lastSpawnRef.current >= PIPE_SPAWN_MS);

      if (shouldSpawn) lastSpawnRef.current = now;

      const next = tick(prev, shouldSpawn);
      stateRef.current = next;

      const snap = uiSnapshot.current;
      if (
        next.status !== snap.status ||
        next.score !== snap.score ||
        next.best !== snap.best
      ) {
        const updated = { status: next.status, score: next.score, best: next.best };
        uiSnapshot.current = updated;
        setUi(updated);
        if (next.status === "over" && next.best > 0) {
          try {
            localStorage.setItem(BEST_KEY, String(next.best));
          } catch {
            /* ignore */
          }
        }
      }

      draw(ctx, next);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  const doFlap = useCallback(() => {
    const current = stateRef.current;
    if (current.status === "over") {
      lastSpawnRef.current = 0;
      const next = restart(current.best);
      stateRef.current = next;
      const updated = { status: next.status, score: 0, best: current.best };
      uiSnapshot.current = updated;
      setUi(updated);
      return;
    }
    const next = flap(current);
    stateRef.current = next;
    if (current.status === "ready") {
      // First pipe appears after a short delay, not a full spawn interval.
      lastSpawnRef.current = performance.now() - PIPE_SPAWN_MS + 500;
      const updated = { status: "playing" as const, score: next.score, best: next.best };
      uiSnapshot.current = updated;
      setUi(updated);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.key === " ") {
        e.preventDefault();
        doFlap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doFlap]);

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-4">
      <div className="relative w-full overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-4 ring-white/30">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="block h-auto w-full touch-none bg-[#70c5ce]"
          onPointerDown={(e) => {
            e.preventDefault();
            doFlap();
          }}
          role="img"
          aria-label="Flappy Bird game canvas. Tap or press Space to flap."
        />

        {ui.status === "ready" && (
          <div className="pointer-events-none absolute inset-x-0 top-[18%] flex flex-col items-center px-6 text-center">
            <p className="rounded-xl bg-[var(--panel)] px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-lg">
              Tap, click, or press Space to flap
            </p>
          </div>
        )}

        {ui.status === "over" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 px-6">
            <div className="w-full max-w-[260px] rounded-2xl bg-[var(--panel)] p-5 text-center text-white shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Game Over
              </p>
              <p className="mt-2 text-4xl font-bold tabular-nums">{ui.score}</p>
              <p className="mt-1 text-sm text-white/80">
                Best:{" "}
                <span className="font-semibold text-[var(--accent)]">{ui.best}</span>
              </p>
              <button
                type="button"
                onClick={doFlap}
                className="mt-4 w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Play again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full items-center justify-between gap-3 rounded-xl bg-white/15 px-4 py-3 text-sm text-white backdrop-blur-sm">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/70">Score</p>
          <p className="text-xl font-bold tabular-nums">{ui.score}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-white/70">Best</p>
          <p className="text-xl font-bold tabular-nums text-[var(--accent)]">{ui.best}</p>
        </div>
        <button
          type="button"
          onClick={doFlap}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[var(--ink)] shadow transition hover:bg-[#fff6d6] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {ui.status === "over" ? "Restart" : ui.status === "playing" ? "Flap" : "Start"}
        </button>
      </div>
    </div>
  );
}
