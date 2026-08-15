export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 600;
export const BIRD_SIZE = 28;
export const BIRD_X = 90;
export const PIPE_WIDTH = 64;
export const PIPE_GAP = 150;
export const PIPE_SPEED = 2.4;
export const GRAVITY = 0.42;
export const FLAP_VELOCITY = -7.2;
export const GROUND_HEIGHT = 72;
export const PIPE_SPAWN_MS = 1600;

export type Pipe = {
  x: number;
  gapY: number;
  scored: boolean;
};

export type GameState = {
  status: "ready" | "playing" | "over";
  birdY: number;
  velocity: number;
  pipes: Pipe[];
  score: number;
  best: number;
  frame: number;
};

export function createInitialState(best = 0): GameState {
  return {
    status: "ready",
    birdY: GAME_HEIGHT / 2 - BIRD_SIZE / 2,
    velocity: 0,
    pipes: [],
    score: 0,
    best,
    frame: 0,
  };
}

export function randomGapY(): number {
  const min = 100;
  const max = GAME_HEIGHT - GROUND_HEIGHT - PIPE_GAP - 80;
  return min + Math.random() * (max - min);
}

export function flap(state: GameState): GameState {
  if (state.status === "over") return state;
  return {
    ...state,
    status: "playing",
    velocity: FLAP_VELOCITY,
  };
}

export function restart(best: number): GameState {
  return createInitialState(best);
}

function collides(birdY: number, pipes: Pipe[]): boolean {
  const birdTop = birdY;
  const birdBottom = birdY + BIRD_SIZE;
  const birdLeft = BIRD_X;
  const birdRight = BIRD_X + BIRD_SIZE;

  if (birdBottom >= GAME_HEIGHT - GROUND_HEIGHT || birdTop <= 0) {
    return true;
  }

  for (const pipe of pipes) {
    const inX = birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH;
    if (!inX) continue;
    const gapTop = pipe.gapY;
    const gapBottom = pipe.gapY + PIPE_GAP;
    if (birdTop < gapTop || birdBottom > gapBottom) {
      return true;
    }
  }
  return false;
}

export function tick(state: GameState, spawnPipe: boolean): GameState {
  if (state.status !== "playing") {
    return { ...state, frame: state.frame + 1 };
  }

  let birdY = state.birdY + state.velocity;
  const velocity = state.velocity + GRAVITY;
  let pipes = state.pipes
    .map((p) => ({ ...p, x: p.x - PIPE_SPEED }))
    .filter((p) => p.x + PIPE_WIDTH > -20);

  if (spawnPipe) {
    pipes = [...pipes, { x: GAME_WIDTH + 10, gapY: randomGapY(), scored: false }];
  }

  let score = state.score;
  pipes = pipes.map((p) => {
    if (!p.scored && p.x + PIPE_WIDTH < BIRD_X) {
      score += 1;
      return { ...p, scored: true };
    }
    return p;
  });

  const hit = collides(birdY, pipes);
  if (hit) {
    birdY = Math.min(birdY, GAME_HEIGHT - GROUND_HEIGHT - BIRD_SIZE);
    return {
      ...state,
      status: "over",
      birdY,
      velocity: 0,
      pipes,
      score,
      best: Math.max(state.best, score),
      frame: state.frame + 1,
    };
  }

  return {
    ...state,
    birdY,
    velocity,
    pipes,
    score,
    frame: state.frame + 1,
  };
}
