export type Rect = { x: number; y: number; w: number; h: number };

export type Enemy = Rect & {
  row: number;
  col: number;
  points: number;
  alive: boolean;
};

export type Bullet = Rect & { vy: number };

export type Status = "ready" | "playing" | "over" | "clear";

export type GameState = {
  status: Status;
  player: Rect;
  enemies: Enemy[];
  playerBullets: Bullet[];
  enemyBullets: Bullet[];
  /** 隊列の横の向き（1 = 右・-1 = 左） */
  direction: 1 | -1;
  score: number;
  lives: number;
  /** 次に撃てるまでの残り秒数 */
  cooldown: number;
  /** 敵が次に撃つまでの残り秒数 */
  enemyFireTimer: number;
};

/** 1 フレームぶんの入力。start は押した瞬間だけ true にする。 */
export type Input = {
  left: boolean;
  right: boolean;
  fire: boolean;
  start: boolean;
};

/** 0 以上 1 未満を返す乱数。テストでは固定の値を渡す。 */
export type Rng = () => number;
