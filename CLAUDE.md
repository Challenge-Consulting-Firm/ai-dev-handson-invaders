# CLAUDE.md

このリポジトリの決まりは `AGENTS.md` にまとめています（Claude Code 以外のエージェントと共通にするため）。

@AGENTS.md

## Claude Code で使うときの補足

- コントローラ役で起動したときは [`docs/handson/controller-prompt.md`](docs/handson/controller-prompt.md) の内容に従う。
- エージェント役は、コントローラから届いた割当文の **1 件だけ**を行う。割当文に無いことは推測で進めず、「質問」で返す。
- 権限の既定（許可するコマンド・読まないファイル）は `.claude/settings.json` にある。
