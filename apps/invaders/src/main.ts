import "./style.css";
import { HEIGHT, WIDTH } from "./game/config";
import { createGame, step } from "./game/game";
import { createKeyboard } from "./input";
import { render } from "./render";

const canvas = document.querySelector<HTMLCanvasElement>("#game");
if (!canvas) throw new Error("#game の canvas がありません");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas 2D が使えません");

// 高解像度の画面でもにじまないよう、実際の画素数を倍率に合わせる
const scale = window.devicePixelRatio || 1;
canvas.width = WIDTH * scale;
canvas.height = HEIGHT * scale;
ctx.scale(scale, scale);

const readInput = createKeyboard();
let state = createGame();
let last = performance.now();

function frame(now: number) {
  // タブを切り替えて戻ったときに一気に進まないよう、1 フレームの最大を 50ms にする
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  state = step(state, readInput(), dt);
  render(ctx!, state, now / 1000);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
