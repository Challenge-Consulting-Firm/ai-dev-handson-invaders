// ゲームの進行。画面やキーボードには触らない純粋なロジックで、テストから直接呼べる。

import { BULLET, ENEMY_FIRE, FORMATION, HEIGHT, PLAYER, ROW_POINTS, WIDTH } from "./config";
import { intersects } from "./collision";
import type { Bullet, Enemy, GameState, Input, Rng } from "./types";

export function createFormation(): Enemy[] {
  const { rows, cols, enemyW, enemyH, gapX, gapY, top } = FORMATION;
  const totalW = cols * enemyW + (cols - 1) * gapX;
  const left = (WIDTH - totalW) / 2;
  const enemies: Enemy[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      enemies.push({
        x: left + col * (enemyW + gapX),
        y: top + row * (enemyH + gapY),
        w: enemyW,
        h: enemyH,
        row,
        col,
        points: ROW_POINTS[row] ?? 10,
        alive: true,
      });
    }
  }
  return enemies;
}

export function createGame(): GameState {
  return {
    status: "ready",
    player: { x: (WIDTH - PLAYER.w) / 2, y: PLAYER.y, w: PLAYER.w, h: PLAYER.h },
    enemies: createFormation(),
    playerBullets: [],
    enemyBullets: [],
    direction: 1,
    score: 0,
    lives: PLAYER.lives,
    cooldown: 0,
    enemyFireTimer: ENEMY_FIRE.interval,
  };
}

/** 残りの敵の数に応じた隊列の横の速さ。減るほど速くなる。 */
export function formationSpeed(alive: number, total: number): number {
  if (total <= 1 || alive <= 0) return FORMATION.baseSpeed * FORMATION.maxSpeedRate;
  const killedRate = (total - alive) / (total - 1);
  return FORMATION.baseSpeed * (1 + (FORMATION.maxSpeedRate - 1) * killedRate);
}

/**
 * 1 フレーム進める。state を書き換えて返す。
 * dt は前のフレームからの秒数。
 */
export function step(state: GameState, input: Input, dt: number, rng: Rng = Math.random): GameState {
  if (state.status !== "playing") {
    if (input.start) {
      const next = createGame();
      next.status = "playing";
      return next;
    }
    return state;
  }

  movePlayer(state, input, dt);
  firePlayer(state, input, dt);
  moveFormation(state, dt);
  fireEnemy(state, dt, rng);
  moveBullets(state, dt);
  resolveHits(state);
  updateStatus(state);
  return state;
}

function movePlayer(state: GameState, input: Input, dt: number): void {
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const p = state.player;
  p.x = clamp(p.x + dir * PLAYER.speed * dt, 0, WIDTH - p.w);
}

function firePlayer(state: GameState, input: Input, dt: number): void {
  state.cooldown = Math.max(0, state.cooldown - dt);
  if (!input.fire || state.cooldown > 0) return;
  const p = state.player;
  state.playerBullets.push(makeBullet(p.x + p.w / 2, p.y - BULLET.h, -BULLET.playerSpeed));
  state.cooldown = BULLET.playerCooldown;
}

function moveFormation(state: GameState, dt: number): void {
  const alive = state.enemies.filter((e) => e.alive);
  if (alive.length === 0) return;

  const dx = state.direction * formationSpeed(alive.length, state.enemies.length) * dt;
  const minX = Math.min(...alive.map((e) => e.x)) + dx;
  const maxX = Math.max(...alive.map((e) => e.x + e.w)) + dx;
  const hitEdge = minX < FORMATION.margin || maxX > WIDTH - FORMATION.margin;

  for (const e of state.enemies) {
    if (hitEdge) e.y += FORMATION.stepDown;
    else e.x += dx;
  }
  if (hitEdge) state.direction = state.direction === 1 ? -1 : 1;
}

function fireEnemy(state: GameState, dt: number, rng: Rng): void {
  state.enemyFireTimer -= dt;
  if (state.enemyFireTimer > 0) return;
  state.enemyFireTimer = ENEMY_FIRE.interval * (0.5 + rng());

  // 列ごとに一番下の敵だけが撃てる
  const shooters = new Map<number, Enemy>();
  for (const e of state.enemies) {
    if (!e.alive) continue;
    const cur = shooters.get(e.col);
    if (!cur || e.row > cur.row) shooters.set(e.col, e);
  }
  const list = [...shooters.values()];
  if (list.length === 0) return;
  const shooter = list[Math.floor(rng() * list.length)];
  state.enemyBullets.push(makeBullet(shooter.x + shooter.w / 2, shooter.y + shooter.h, BULLET.enemySpeed));
}

function moveBullets(state: GameState, dt: number): void {
  for (const b of [...state.playerBullets, ...state.enemyBullets]) b.y += b.vy * dt;
  const onScreen = (b: Bullet) => b.y + b.h > 0 && b.y < HEIGHT;
  state.playerBullets = state.playerBullets.filter(onScreen);
  state.enemyBullets = state.enemyBullets.filter(onScreen);
}

function resolveHits(state: GameState): void {
  state.playerBullets = state.playerBullets.filter((b) => {
    const target = state.enemies.find((e) => e.alive && intersects(b, e));
    if (!target) return true;
    target.alive = false;
    state.score += target.points;
    return false;
  });

  const hit = state.enemyBullets.some((b) => intersects(b, state.player));
  if (hit) {
    state.lives -= 1;
    state.enemyBullets = [];
    state.player.x = (WIDTH - state.player.w) / 2;
  }
}

function updateStatus(state: GameState): void {
  const alive = state.enemies.filter((e) => e.alive);
  if (state.lives <= 0) state.status = "over";
  else if (alive.some((e) => e.y + e.h >= state.player.y)) state.status = "over";
  else if (alive.length === 0) state.status = "clear";
}

function makeBullet(centerX: number, y: number, vy: number): Bullet {
  return { x: centerX - BULLET.w / 2, y, w: BULLET.w, h: BULLET.h, vy };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
