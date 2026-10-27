# AI 開発ハンズオン — AI Invaders

AI を使った開発のハンズオン用の題材です。ブラウザで遊べる小さなインベーダーゲーム（**AI Invaders**）を、
Claude Code のセッションを複数並べて、Issue と PR で少しずつ育てていきます。

- **API キー不要・外部サービス不要**。ゲームはブラウザの中だけで動きます。
- **Docker だけで動く**。`docker compose up --build` すれば遊べます（ホストに Node.js は要りません）。Windows は WSL 2 の Docker Engine で動かすので、Docker Desktop のライセンスは要りません。
- 変更が**画面で目に見える**ので、エージェントの仕事の成果をその場で確かめられます。

```
ai-dev-handson-invaders/
├── docker-compose.yml          # ゲームをコンテナで起動
├── apps/invaders/              # AI Invaders（Vite + TypeScript + Canvas）
│   ├── Dockerfile              # Node.js でビルド → nginx で配信
│   └── src/
│       ├── main.ts             # 起動とゲームループ
│       ├── input.ts            # キーボード入力
│       ├── render.ts           # Canvas への描画
│       └── game/               # ゲームのルール（画面に触らない純粋なロジック・テストあり）
│           ├── config.ts       #   数値の設定（速さ・隊列・得点など）
│           ├── game.ts         #   1 フレーム進める step()
│           ├── collision.ts    #   当たり判定
│           └── game.test.ts    #   テスト（Vitest）
└── docs/handson/               # ハンズオンの手順・割当文・サンプル Issue
```

## 事前の準備

| OS | 使うもの |
|---|---|
| **Windows** | WSL 2 の Ubuntu に **Docker Engine**（無料・Apache 2.0）を直接入れる。Docker Desktop は使わない。下の「Windows の事前準備」 |
| **Mac** | `docker compose` が動けばよい。Docker Desktop は会社の規模によって有料のため、無料で使うなら [Colima](https://github.com/abiosoft/colima)（Homebrew で `colima`・`docker`・`docker-compose` を入れ、`brew` が最後に出す案内どおりに `docker compose` を使えるようにしてから `colima start`） |

> Docker Desktop は、従業員 250 人以上または年間売上 1,000 万ドル以上の会社での業務利用には有料のサブスクリプションが要ります。
> Windows の手順は、このライセンスに当たらない Docker Engine（WSL 2 の Ubuntu に入れる）にそろえています。

## Mac の事前準備

ゲームを遊ぶだけなら、上の表の Docker（Docker Desktop か Colima）だけで「遊ぶ」に進めます。
ハンズオンで開発の流れを動かす人は、加えて herdr を入れます（[公式の入れ方](https://herdr.dev/docs/install/)）。

```bash
# どちらか
brew install herdr
curl -fsSL https://herdr.dev/install.sh | sh
```

- 入ったかどうかは `herdr --version` で確かめる。
- 新しい版にするときは `herdr update`（Homebrew で入れたときは `brew upgrade herdr`）。
- ほかに使う道具（Claude Code・gh・git・Node.js 22 以上）と確かめ方は、[ハンズオンの手順の「事前に用意するもの」](docs/handson/README.md#1-事前に用意するもの)の表にあります。

## Windows の事前準備

当日までに次を済ませておきます。**① 〜 ③ はゲームを遊ぶだけの人（受講者）も必要**、④ はハンズオンで開発の流れを動かす人だけ必要です。
② 以降のコマンドは、すべて **Ubuntu の画面（スタートメニューの「Ubuntu」）** で実行します。PowerShell で実行するのは ① だけです。

### ① WSL 2 を入れる

PowerShell を**管理者として実行**し、次を実行して Windows を再起動します。

```powershell
wsl --install
```

再起動後に Ubuntu の画面が開くので、Ubuntu の中で使うユーザー名とパスワードを決めます（Windows のものとは別でよい）。
入ったかどうかは PowerShell で確かめます（`Ubuntu` の `VERSION` が `2` になっていればよい）。

```powershell
wsl -l -v
```

> `wsl --install` が「仮想化が無効」で止まるときは、PC の BIOS／UEFI の設定で仮想化（Intel VT-x／AMD-V）を有効にします。会社の PC で変えられないときは、情報システムの担当に相談してください。

### ② Ubuntu に Docker Engine を入れる

Ubuntu の画面で、Docker の公式のパッケージ置き場を登録してから入れます（[公式の手順](https://docs.docker.com/engine/install/ubuntu/)と同じ）。

```bash
# Docker の公式のパッケージ置き場を登録する
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker Engine と Compose を入れる
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# sudo なしで docker を使えるようにする
sudo usermod -aG docker $USER
```

最後の設定を効かせるため、**PowerShell で `wsl --shutdown` を実行してから、Ubuntu を開き直します**。

> Docker Desktop がすでに入っている PC では、Docker Desktop の **Settings → Resources → WSL integration** で Ubuntu を**オフ**にしてください（2 つの Docker がぶつかるため）。

### ③ 動作を確かめる

Ubuntu の画面で次を実行し、エラーが出なければ準備はできています。

```bash
docker run --rm hello-world
docker compose version
```

続けて、下の「遊ぶ」の手順で http://localhost:8080 が開けることを確かめます。

### ④ ハンズオンで開発の流れを動かす人だけ

herdr・`tools/assign.sh`・`claude -p` のパイプは bash 前提のため、同じ Ubuntu の中で行います。

```bash
# 基本の道具
sudo apt-get install -y build-essential

# Node.js 22（nvm で入れる）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22

# Claude Code
curl -fsSL https://claude.ai/install.sh | bash

# herdr（Linux 版を入れる。WSL 2 の Ubuntu は Linux として動く）
curl -fsSL https://herdr.dev/install.sh | sh
```

- **GitHub CLI（gh）**: [公式の Linux 向けの手順](https://github.com/cli/cli/blob/trunk/docs/install_linux.md)（Debian / Ubuntu の項）で入れ、`gh auth login` でログインする。
- **herdr**: 上のコマンドで入る（[公式の入れ方](https://herdr.dev/docs/install/)）。`~/.local/bin` に入るため、`herdr` が見つからないときは Ubuntu を開き直す（それでも見つからないときは `echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc` を実行して開き直す）。
  herdr には Windows 版（ベータ）もあるが、このハンズオンは `tools/assign.sh` などが bash 前提のため、**WSL 2 の中の Linux 版**を使う。
  公式の資料は WSL 2 の中での利用を明記していないため、前日の通し稽古で `herdr` の起動とペインの分割まで必ず確かめる。
- 当日は herdr の 3 つのペイン（コントローラ・エージェント 2 つ）を、すべてこの Ubuntu の中で起動する。

入ったかどうかは次で確かめます。

```bash
git --version && node --version && gh auth status && claude --version && herdr --version && docker compose version
```

### Windows で詰まりやすい所

| 症状 | 確かめること・直し方 |
|---|---|
| `permission denied ... docker.sock` | ② の `usermod` の後に、PowerShell で `wsl --shutdown` → Ubuntu を開き直したか |
| `Cannot connect to the Docker daemon` | `sudo systemctl status docker` で動いているか。`ps -p 1 -o comm=` が `systemd` でないときは、`/etc/wsl.conf` に `[boot]` と `systemd=true` の 2 行を書き、`wsl --shutdown` してから開き直す |
| `docker compose up` で「ポートが使えない」 | Windows が予約しているポートと重なっていることがある。PowerShell で `netsh interface ipv4 show excludedportrange protocol=tcp` を見て、範囲の外のポートを `INVADERS_PORT` で指定する（下の「遊ぶ」を参照） |
| Windows のブラウザで http://localhost:8080 が開かない | 社内のプロキシの設定で `localhost` が除外されているか。`http://127.0.0.1:8080` も試す。それでも開かないときは、Ubuntu で `hostname -I` を実行し、出た IP アドレスの `:8080` を開く |
| clone やビルドが遅い・改行がおかしい | clone を Windows 側（`/mnt/c/...`）に置いていないか。**WSL 2 のホーム（`~/`）に clone する** |

## 遊ぶ

必要なもの: 上の「事前の準備」（Windows は ① 〜 ③ を済ませ、**Ubuntu の画面で**実行する）

```bash
git clone https://github.com/Challenge-Consulting-Firm/ai-dev-handson-invaders.git
cd ai-dev-handson-invaders
docker compose up --build
```

ブラウザで http://localhost:8080 を開きます（Windows も、Windows 側のふだんのブラウザで開けます）。

| キー | 動き |
|---|---|
| ← → または A D | 移動 |
| Space（または ↑ / W） | 発射 |
| Enter / Space | スタート・もう一度 |

止めるときは `Ctrl+C`、または `docker compose down` です。

ポート 8080 がほかで使われているときは、ポートを変えて起動します。

```bash
INVADERS_PORT=8081 docker compose up --build
```

> 初回のビルドでは Docker Hub から `node` と `nginx` のイメージを取ってきます。会場の同じ回線から大勢が一斉に取ると回数の制限に当たることがあるため、**前日までに一度ビルドしておいてください**。

## 開発する（Node.js で直接動かす）

ゲームを直しながら確かめるときは、Node.js 22 以上で開発サーバーを使います（保存するとすぐ画面に反映されます）。

```bash
cd apps/invaders
npm ci
npm run dev          # http://localhost:5173
```

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー（ポート 5173。並行で使うときは `npm run dev -- --port 5174`） |
| `npm run typecheck` | 型検査 |
| `npm test` | テスト（`src/game/` のルール） |
| `npm run build` | 型検査＋本番用のビルド（`dist/`） |

ゲームのルールを変えるときは `src/game/` を直し、`src/game/game.test.ts` にテストを足します。
見た目を変えるときは `src/render.ts` を直します。数値の調整（速さ・残機・得点）は `src/game/config.ts` だけで済みます。

## AI を使った開発の進め方（ハンズオン）

このリポジトリは、Claude Code のセッションを複数並べて開発する流れのハンズオンに使います。

- 決まり（役割・開発の流れ・してはいけないこと）: [AGENTS.md](AGENTS.md)（Claude Code は [CLAUDE.md](CLAUDE.md) から読み込む）
- 当日の手順（herdr の画面の並べ方・流れ・コマンド）: [docs/handson/README.md](docs/handson/README.md)
- コントローラ役の起動文: [docs/handson/controller-prompt.md](docs/handson/controller-prompt.md)
- 割当文の型と例: [docs/handson/assign-examples.md](docs/handson/assign-examples.md)
- サンプルの Issue の下書き: [docs/handson/sample-issues/](docs/handson/sample-issues/)
- Issue と PR のひな形: [.github/ISSUE_TEMPLATE/change.md](.github/ISSUE_TEMPLATE/change.md)・[.github/pull_request_template.md](.github/pull_request_template.md)
- 自動チェック（PR ごとに型検査・テスト・ビルド・コンテナのビルド）: [.github/workflows/ci.yml](.github/workflows/ci.yml)
