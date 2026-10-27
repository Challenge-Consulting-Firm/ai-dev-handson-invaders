<!--
サンプル Issue B（ハンズオン用の下書き）。
作り方: gh issue create --title "AI Invaders: 敵を全部倒したら次の面に進む" --body-file docs/handson/sample-issues/02-next-wave.md
このコメントは Issue の本文に入っても見えません。
-->
## 目的

AI Invaders は、敵を全部倒すと「CLEAR!」で終わり、もう一度遊ぶと最初の面・スコア 0 に戻ってしまいます。
**次の面（ウェーブ）に進み、面が進むほど敵が速くなる**ようにして、続けて遊べるようにします。

## 変更する範囲

- `apps/invaders/src/game/` 配下だけ（`game.ts`・`types.ts`・`config.ts`・`game.test.ts`）
  （`step()` は画面に触らない純粋な関数なので、ルールの変更はテストで確かめられる）

## 受入条件

- [ ] `GameState` に今の面の番号 `wave`（1 から始まる）がある
- [ ] 状態が `clear` のときに start の入力が来ると、**スコアと残機はそのまま**で、`wave` が 1 増え、敵の隊列が最初の位置に並び直して `playing` になる
- [ ] 状態が `over` のときに start の入力が来ると、今までどおり最初から（面 1・スコア 0）始まる
- [ ] 隊列の横の速さが、面ごとに 1.2 倍ずつ速くなる（面 1 は今と同じ速さ。倍率は `config.ts` に置く）
- [ ] 上の 3 つを確かめるテストが `game.test.ts` にあり、`npm test`・`npm run typecheck`・`npm run build` が通る

## やらないこと

- 画面（`src/render.ts`・`src/main.ts`）の変更。面の番号を画面に出すこと・「CLEAR!」の文言を変えることは、別の Issue にする
  （同時に別の Issue がハイスコアの表示で `render.ts` と `main.ts` を触るため）
- 敵の弾の速さや間隔など、受入条件にない数値の変更。気になる所を見つけたら、**直さずにこの Issue へコメント**で書く
