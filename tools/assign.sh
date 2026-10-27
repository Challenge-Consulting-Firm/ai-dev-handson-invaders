#!/usr/bin/env bash
# エージェントに割当文を送る（コントローラが使う）。
#   使い方: bash tools/assign.sh <エージェントの名前> <clear|compact|none> <割当文のファイル>
#   - clear  : 無関係な新しい Issue のとき（前の文脈を持ち込ませない）
#   - compact: 同じ Issue の続き（差し戻しなど）のとき
#   - none   : 何も挟まずに送る（片付けの指示など）
# 相手が入力待ち（idle / done）であることを確かめてから送る。確認の画面で止まっている（blocked）ときは送らずに止める。
# /clear の後は中のセッションが替わり herdr の名前が外れることがあるため、pane ID で送り、送った後に名前を確かめて付け直す。
set -euo pipefail
NAME="${1:?エージェントの名前}"; MODE="${2:?clear|compact|none}"; FILE="${3:?割当文のファイル}"
case "${MODE}" in clear|compact|none) ;; *) echo "2 つ目は clear / compact / none のどれか" >&2; exit 2;; esac
[ -f "${FILE}" ] || { echo "割当文のファイルがありません: ${FILE}" >&2; exit 2; }

# herdr agent list の JSON から 1 項目を取り出す（Node.js で読む）
#   field_of <照合する項目> <値> <取り出す項目>
field_of() {
  herdr agent list | node -e '
    let s = ""; process.stdin.on("data", (c) => (s += c)).on("end", () => {
      const [key, val, out] = process.argv.slice(1);
      const a = JSON.parse(s).result.agents.find((x) => (x[key] ?? "") === val);
      process.stdout.write(a ? String(a[out] ?? "") : "");
    });' "$1" "$2" "$3"
}
status_of() { field_of pane_id "$1" agent_status; }

PANE="$(field_of name "${NAME}" pane_id)"
[ -n "${PANE}" ] || { echo "名前 ${NAME} のエージェントが見つかりません（herdr agent list で確かめる）" >&2; exit 1; }

require_ready() {
  local st; st="$(status_of "${PANE}")"
  case "${st}" in
    idle|done) ;;
    *) echo "${NAME}（${PANE}）は入力待ちではありません（状態: ${st:-不明}）。herdr agent read ${PANE} --lines 40 で画面を見てください。送っていません。" >&2; exit 1;;
  esac
}

require_ready
if [ "${MODE}" != none ]; then
  herdr agent prompt "${PANE}" "/${MODE}" >/dev/null
  sleep 3
  # 既定の待ちは idle / done / blocked のどれか（/compact は数十秒かかることがある）
  herdr agent wait "${PANE}" --timeout 600000 >/dev/null || { echo "/${MODE} の完了を待てませんでした。送っていません。" >&2; exit 1; }
  require_ready
fi
herdr agent prompt "${PANE}" "$(cat "${FILE}")" >/dev/null
echo "送りました: ${NAME}（${PANE}）← ${FILE}"

# 名前を確かめる。/clear の直後は差し替えが遅れて届き、いったん残った名前が後から外れることがあるため、
# 30 秒のあいだ見続け、外れていたら付け直す。最後に付いていなければ失敗で返す。
for _ in 1 2 3 4 5 6; do
  sleep 5
  [ "$(field_of pane_id "${PANE}" name)" = "${NAME}" ] || herdr agent rename "${PANE}" "${NAME}" >/dev/null 2>&1 || true
done
if [ "$(field_of pane_id "${PANE}" name)" != "${NAME}" ]; then
  echo "注意: ${PANE} に名前 ${NAME} を付け直せませんでした（herdr agent rename ${PANE} ${NAME}）" >&2
  exit 1
fi
