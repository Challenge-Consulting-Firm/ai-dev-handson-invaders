// キーボードの状態を集めて、1 フレームぶんの Input にする。

import type { Input } from "./game/types";

const LEFT = new Set(["ArrowLeft", "KeyA"]);
const RIGHT = new Set(["ArrowRight", "KeyD"]);
const FIRE = new Set(["Space", "KeyW", "ArrowUp"]);
const START = new Set(["Enter", "Space"]);

export function createKeyboard(target: Window = window) {
  const down = new Set<string>();
  let startPressed = false;

  target.addEventListener("keydown", (e) => {
    const handled = LEFT.has(e.code) || RIGHT.has(e.code) || FIRE.has(e.code) || START.has(e.code);
    if (handled) e.preventDefault(); // 矢印キーやスペースで画面がスクロールしないようにする
    if (START.has(e.code) && !e.repeat) startPressed = true;
    down.add(e.code);
  });
  target.addEventListener("keyup", (e) => down.delete(e.code));
  target.addEventListener("blur", () => down.clear());

  const any = (keys: Set<string>) => [...keys].some((k) => down.has(k));

  /** 今のフレームの入力を返す。start は押した瞬間の 1 回だけ true になる。 */
  return function read(): Input {
    const input: Input = { left: any(LEFT), right: any(RIGHT), fire: any(FIRE), start: startPressed };
    startPressed = false;
    return input;
  };
}
