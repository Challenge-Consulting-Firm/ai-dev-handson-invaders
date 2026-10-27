# ハンズオン: herdr と Claude Code で「コントローラ＋エージェント」の開発を回す

AI のセッションを 1 つで使うのではなく、**コントローラ 1 つ＋エージェント 2 つ**を herdr の画面に並べ、
GitHub の Issue と PR でつないで開発する流れを、このリポジトリの小さな変更 2 件で見せます。

使う道具は 5 つだけです: **herdr**・**Claude Code（CLI）**・**gh**・**git**・**GitHub の Issue と PR**。

## 1. 事前に用意するもの

| もの | 確かめ方 |
|---|---|
| herdr | `herdr --version` |
| Claude Code（ログイン済み） | `claude --version`（初回は `claude` を起動してログイン） |
| GitHub CLI（ログイン済み・このリポジトリに書込み権限） | `gh auth status` |
| git・Node.js 22 以上 | `git --version`・`node --version`（`tools/assign.sh` も Node.js で動く） |
| Docker（Windows は WSL 2 の Docker Engine・Mac は Colima など） | `docker compose version`（受講者に完成品を遊んでもらう・始める前の動作確認に使う） |
| このリポジトリの clone | `gh repo clone Challenge-Consulting-Firm/ai-dev-handson-invaders` |

- 前日に一度 `docker compose up --build` で http://localhost:8080 が遊べること、
  `apps/invaders` で `npm ci`・`npm test`・`npm run dev`（http://localhost:5173）が通ることを確かめておく。
- API キー（`.env`）は要らない。ゲームはブラウザの中だけで動き、外部のサービスを使わない。

### Windows で行うとき

Windows の準備（WSL 2 の入れ方・Docker Engine の入れ方・Ubuntu の中に入れる道具・詰まりやすい所）は、
**ルートの [README の「Windows の事前準備」](../../README.md#windows-の事前準備) の ① 〜 ④ をすべて**行います。ここには書きません。

## 2. 画面の並べ方（herdr）

```bash
cd ai-dev-handson-invaders
herdr
```

1 つのワークスペースを 3 つのペインに分け、それぞれで `claude` を起動して名前を付けます。

```text
┌──────────────────────┬──────────────────────┐
│ controller           │ agent-a              │
│ （コントローラ）     │ （サンプル A・画面）  │
│                      ├──────────────────────┤
│                      │ agent-b              │
│                      │ （サンプル B・ルール）│
└──────────────────────┴──────────────────────┘
```

ペインを分けた後、**左のペイン**で次を実行します（コマンドで分ける場合は `herdr pane split --help` を参照）。
右の 2 つにエージェントを起動し、最後に左のペイン自身でコントローラを起動します。

```bash
herdr pane list
herdr agent start agent-a --kind claude --pane <右上のペイン ID>
herdr agent start agent-b --kind claude --pane <右下のペイン ID>
claude
```

コントローラの `claude` が起動したら、別のペイン（または `!` で）名前を付けて確かめます。

```bash
herdr agent rename <左のペイン ID> controller
herdr agent list
```

- `herdr agent start` は、相手のペインがシェルの入力待ちのときだけ使える（自分自身のペインには使えない）。
- 3 つとも、clone したフォルダー（このリポジトリの直下）で起動する。エージェントは割当文に従って自分の worktree を作り、そこで作業する。

## 3. 当日の流れ

| 段 | 誰が | 何をする | 画面で見せるところ |
|---|---|---|---|
| ① 起動 | 人間 | コントローラに [`controller-prompt.md`](controller-prompt.md) を送る | 役割を文章で渡している |
| ② Issue | コントローラ | サンプルの下書きから Issue を 2 件作る（下のコマンド） | GitHub の Issue の画面（目的・範囲・受入条件・やらないこと） |
| ③ 棚卸し | コントローラ | Issue・PR・エージェント・worktree の表を作る | 「誰が何を持っているか」を先に確かめる |
| ④ 割当 | コントローラ | [`assign-examples.md`](assign-examples.md) の型で 2 件を割り当てる | 触るファイルを名指しで分けている |
| ⑤ 実装 | エージェント 2 つ（並行） | worktree を作って push → 実装 → 型検査・テスト → 画面の確認 | 2 つが別々のフォルダーで同時に進む |
| ⑥ レビュー | エージェント | `claude -p` に差分を見せ、指摘と対応を Issue にコメント | 「直した／直さない＋理由」が Issue に残る |
| ⑦ PR | エージェント | ひな形どおりに PR を作り、CI の緑を確かめて報告 | PR の画面・自動チェック・`Closes #…` |
| ⑧ 確認 | コントローラ | PR の範囲・CI・レビューの記録を確かめて人間へ報告 | 人間が見るのは報告と PR だけでよい |
| ⑨ マージ | 人間 | PR をマージし、コントローラに片付けを指示させる | マージは人間だけが行う |
| ⑩ 遊ぶ | 人間・受講者 | main を pull して `docker compose up --build` → http://localhost:8080 | ハイスコアと次の面が入ったゲームを、その場で遊ぶ |

Issue を作るコマンド（コントローラが実行する）:

```bash
gh issue create --title "AI Invaders: ハイスコアを保存して画面に出す" --body-file docs/handson/sample-issues/01-high-score.md
gh issue create --title "AI Invaders: 敵を全部倒したら次の面に進む" --body-file docs/handson/sample-issues/02-next-wave.md
```

## 4. 時間の目安と、詰まったとき

- エージェントの実装からレビュー・PR までは、1 件 10〜20 分かかることがある。並行で進めている間に、
  Issue の書き方・割当文・`AGENTS.md`・`.claude/settings.json` を説明する。
- 当日に間に合わない場合に備え、**前日に同じ流れを 1 回通した記録**（Issue・PR・画面の写し）を用意し、
  「事前に行った記録」と「当日その場で行っていること」を分けて見せる。
- エージェントが止まったときは、まず画面を読む: `herdr agent read agent-a --lines 40`。
  権限の確認で止まっているなら、人間が内容を見て許可するか断る（中身を読まずに許可しない）。
- `.claude/settings.json` で、よく使うコマンド（型検査・テスト・Issue と PR の作成など）は確認なしで動く。
  **push・開発サーバーの起動・依存の追加など、それ以外は毎回確認が出る**＝人間が見る所として、当日も画面で見せる。

## 5. 終わった後の片付け

- 人間がマージした後、コントローラが `gh pr view <PR 番号> --json state` で `MERGED` を確かめ、
  エージェントに worktree とブランチの片付けを指示する（[`assign-examples.md`](assign-examples.md) の最後の例）。
- デモで作った Issue・PR をもう一度使う場合は、main を元に戻す PR を作るか、次回は別の題材にする。
