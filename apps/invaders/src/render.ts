// GameState を Canvas に描く。ゲームの進行には触らない。

import { HEIGHT, WIDTH } from "./game/config";
import type { Enemy, GameState, Rect } from "./game/types";

const COLORS = {
  background: "#0b1020",
  player: "#4ade80",
  playerBullet: "#f8fafc",
  enemyBullet: "#f97316",
  text: "#e2e8f0",
  dim: "#94a3b8",
  ground: "#334155",
  rows: ["#f472b6", "#c084fc", "#60a5fa", "#22d3ee", "#a3e635"],
};

// 敵の形（1 = 塗る）。2 コマを交互に出して動いて見せる。
const ENEMY_FRAMES = [
  ["00100100", "00011000", "01111110", "11011011", "11111111", "10111101", "10000001", "01000010"],
  ["00100100", "10011001", "11111111", "11011011", "11111111", "00111100", "01000010", "10000001"],
];

export function render(ctx: CanvasRenderingContext2D, state: GameState, time: number): void {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const frame = Math.floor(time * 2) % 2;
  for (const e of state.enemies) if (e.alive) drawEnemy(ctx, e, frame);

  drawPlayer(ctx, state.player);
  ctx.fillStyle = COLORS.playerBullet;
  for (const b of state.playerBullets) fillRect(ctx, b);
  ctx.fillStyle = COLORS.enemyBullet;
  for (const b of state.enemyBullets) fillRect(ctx, b);

  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, HEIGHT - 28, WIDTH, 2);

  drawHud(ctx, state);
  drawOverlay(ctx, state);
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, frame: number): void {
  const bitmap = ENEMY_FRAMES[frame];
  const cell = Math.min(e.w, e.h) / bitmap.length;
  const offsetX = e.x + (e.w - cell * bitmap[0].length) / 2;
  ctx.fillStyle = COLORS.rows[e.row % COLORS.rows.length];
  bitmap.forEach((line, y) => {
    [...line].forEach((c, x) => {
      if (c === "1") ctx.fillRect(offsetX + x * cell, e.y + y * cell, cell, cell);
    });
  });
}

function drawPlayer(ctx: CanvasRenderingContext2D, p: Rect): void {
  ctx.fillStyle = COLORS.player;
  ctx.fillRect(p.x, p.y + p.h / 2, p.w, p.h / 2);
  ctx.fillRect(p.x + p.w * 0.2, p.y + p.h * 0.25, p.w * 0.6, p.h * 0.25);
  ctx.fillRect(p.x + p.w / 2 - 2, p.y, 4, p.h * 0.25);
}

function drawHud(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.fillStyle = COLORS.text;
  ctx.font = "16px ui-monospace, Menlo, Consolas, monospace";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText(`SCORE ${String(state.score).padStart(5, "0")}`, 16, 16);
  ctx.textAlign = "right";
  ctx.fillText(`LIVES ${"▲".repeat(Math.max(0, state.lives))}`, WIDTH - 16, 16);
}

function drawOverlay(ctx: CanvasRenderingContext2D, state: GameState): void {
  const messages: Record<GameState["status"], [string, string] | null> = {
    ready: ["AI INVADERS", "Enter / Space でスタート"],
    playing: null,
    over: ["GAME OVER", "Enter / Space でもう一度"],
    clear: ["CLEAR!", "Enter / Space でもう一度"],
  };
  const m = messages[state.status];
  if (!m) return;

  ctx.fillStyle = "rgba(11, 16, 32, 0.7)";
  ctx.fillRect(0, HEIGHT / 2 - 70, WIDTH, 140);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLORS.text;
  ctx.font = "bold 36px ui-monospace, Menlo, Consolas, monospace";
  ctx.fillText(m[0], WIDTH / 2, HEIGHT / 2 - 18);
  ctx.fillStyle = COLORS.dim;
  ctx.font = "16px system-ui, sans-serif";
  ctx.fillText(m[1], WIDTH / 2, HEIGHT / 2 + 24);
  if (state.status === "ready") ctx.fillText("← → / A D で移動・Space で発射", WIDTH / 2, HEIGHT / 2 + 50);
}

function fillRect(ctx: CanvasRenderingContext2D, r: Rect): void {
  ctx.fillRect(r.x, r.y, r.w, r.h);
}
