// ゲームの数値の設定。座標はすべて論理ピクセル（画面の大きさに関係しない）。

export const WIDTH = 480;
export const HEIGHT = 640;

export const PLAYER = {
  w: 32,
  h: 16,
  y: HEIGHT - 56,
  speed: 220, // ピクセル／秒
  lives: 3,
};

export const BULLET = {
  w: 3,
  h: 12,
  playerSpeed: 520,
  enemySpeed: 220,
  playerCooldown: 0.35, // 秒
};

export const FORMATION = {
  rows: 5,
  cols: 9,
  enemyW: 28,
  enemyH: 20,
  gapX: 14,
  gapY: 14,
  top: 80,
  baseSpeed: 30, // 全員そろっているときの横の速さ（ピクセル／秒）
  maxSpeedRate: 4, // 残り 1 体のときに baseSpeed の何倍になるか
  stepDown: 16, // 端に着いたときに下がる量
  margin: 12, // 左右の端からの余白
};

// 行ごとの得点（上の行ほど高い）
export const ROW_POINTS = [50, 40, 30, 20, 10];

export const ENEMY_FIRE = {
  interval: 1.1, // 秒（平均）
};
