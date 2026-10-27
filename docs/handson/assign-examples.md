# 割当文の型と例

コントローラがエージェントへ送る割当文です。エージェントは `/clear` で前の文脈を失うため、**毎回それだけで分かる文**にします。

## 型（8 項目・欠けると相手が推測で埋める）

1. 誰の指示か（人間の承認済みか、コントローラの判断か）
2. Issue の番号・題名
3. やること（番号付き・受入条件は Issue を正とする）
4. やらないこと
5. ほかのエージェントが触る場所（ファイル名で名指し）
6. 作業場所（ブランチ名・worktree の場所）
7. PR の形（`Closes` は 1 件・ひな形どおり）
8. 終わったらコントローラへ報告して待機

---

## 例 A（画面の変更）

```text
【controller→agent-a 割当】人間の承認済み（当日のデモ）。

Issue #<A>「AI Invaders: ハイスコアを保存して画面に出す」を 1 件だけ行ってください。受入条件は Issue の本文が正です。

1. git fetch origin のあと、origin/main からブランチ demo/<A>-high-score を作り、worktree ../ai-dev-handson-invaders-wt/demo-<A> で作業する。作った直後に git push -u origin demo/<A>-high-score。
2. apps/invaders で npm ci → 実装 → npm run typecheck・npm test・npm run build。
3. npm run dev（ポート 5173）でブラウザを開き、1 回遊んでハイスコアの更新と、再読み込みで残ることを確かめる。確かめたら、起動したポートのプロセスだけを止める。
4. 変更をコミットして push し、AGENTS.md の手順 5 のとおり claude -p でレビューを受け、指摘と「直した／直さない＋理由」を Issue #<A> にコメントする。
5. ひな形どおりに PR を作り（Closes #<A> を 1 件だけ）、gh pr checks --watch で CI の緑を確かめる。

やらないこと: マージ・apps/invaders/src/game/ 配下の変更・package.json の変更・docker compose の起動。
ほかのエージェント: agent-b が apps/invaders/src/game/ 配下を触っています。触らないでください。

終わったら herdr agent prompt controller "【agent-a→controller 完了】PR #… …" で報告し、待機してください。
```

## 例 B（ルールの変更とテスト）

```text
【controller→agent-b 割当】人間の承認済み（当日のデモ）。

Issue #<B>「AI Invaders: 敵を全部倒したら次の面に進む」を 1 件だけ行ってください。受入条件は Issue の本文が正です。

1. git fetch origin のあと、origin/main からブランチ demo/<B>-next-wave を作り、worktree ../ai-dev-handson-invaders-wt/demo-<B> で作業する。作った直後に git push -u origin demo/<B>-next-wave。
2. apps/invaders で npm ci → 先に受入条件のテストを game.test.ts に書く → 実装 → npm test・npm run typecheck・npm run build。
3. 受入条件にない数値は変えない。気になる動きを見つけたら、直さずに Issue #<B> にコメントする。
4. 変更をコミットして push し、AGENTS.md の手順 5 のとおり claude -p でレビューを受け、指摘と「直した／直さない＋理由」を Issue #<B> にコメントする。
5. ひな形どおりに PR を作り（Closes #<B> を 1 件だけ）、gh pr checks --watch で CI の緑を確かめる。

やらないこと: マージ・src/render.ts と src/main.ts の変更・開発サーバーの起動（ポート 5173 は agent-a が使います。画面で見たいときはコントローラに「質問」で聞く）・package.json の変更。
ほかのエージェント: agent-a が apps/invaders/src/render.ts・src/main.ts・src/highscore.ts を触っています。触らないでください。

終わったら herdr agent prompt controller "【agent-b→controller 完了】PR #… …" で報告し、待機してください。
```

## マージの後の片付けの指示（例）

```text
【controller→agent-a 片付け】PR #<PR> は MERGED を確かめました（gh pr view <PR> --json state）。
自分の worktree ../ai-dev-handson-invaders-wt/demo-<A> を git worktree remove で消し、ローカルのブランチ demo/<A>-high-score を消してください。
ほかのエージェントの worktree には触らないでください。終わったら報告して待機してください。
```
