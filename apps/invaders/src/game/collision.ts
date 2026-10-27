import type { Rect } from "./types";

/** 2 つの長方形が重なっているか（辺が接しているだけなら重ならない） */
export function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
