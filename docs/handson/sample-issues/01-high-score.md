<!--
サンプル Issue A（ハンズオン用の下書き）。
作り方: gh issue create --title "AI Invaders: ハイスコアを保存して画面に出す" --body-file docs/handson/sample-issues/01-high-score.md
このコメントは Issue の本文に入っても見えません。
-->
## 目的

AI Invaders は、ゲームオーバーになるとスコアが消えてしまい、前の自分の記録と比べられません。
**ハイスコア**をブラウザに保存し、画面の上に出して、もう一度遊ぶ動機を作ります。

## 変更する範囲

- `apps/invaders/src/render.ts`（画面上部の表示）
- `apps/invaders/src/main.ts`（ゲームオーバー／クリアになったときにハイスコアを更新する）
- 新しいファイル `apps/invaders/src/highscore.ts`（ブラウザの `localStorage` への読み書き）

## 受入条件

- [ ] 画面上部の中央に `HI 00310` の形（5 桁・0 埋め）でハイスコアが出る
- [ ] ゲームオーバーまたはクリアになったとき、今回のスコアがハイスコアより高ければ更新される
- [ ] ページを再読み込みしても、ハイスコアが残っている
- [ ] `localStorage` が使えないブラウザ（プライベートブラウズなど）でも、ゲームは止まらずに遊べる（ハイスコアは 0 のまま）
- [ ] `npm run typecheck`・`npm test`・`npm run build` が通る
- [ ] ブラウザで 1 回遊んでハイスコアが更新されること・再読み込みで残ることを確かめる（スクリーンショットを PR に貼る）

## やらないこと

- ゲームのルール（`apps/invaders/src/game/` 配下）の変更（同時に別の Issue が「次の面」を足すため）
- ハイスコアのランキング（複数件）や名前の入力
- `package.json` の変更（新しいライブラリは入れない）
