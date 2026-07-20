# アキネーター風ゲーム 実装プラン

## 概要

「頭の中で何かを思い浮かべて、YES/NOで答えると当ててくれる」ゲーム。
APIキー不要・完全クライアントサイド実装。

---

## 制約と前提

- GitHub Pages（静的ファイルのみ）→ APIキー使用不可
- 小学生向け：わかりやすいテーマ・UI
- 単一HTMLファイル + データJSONファイル構成

---

## テーマ案

**「なんの動物？」** を第一弾として実装（著作権フリー・小学生に馴染み深い）

- 動物50〜60種をデータとして定義
- 将来的に「食べ物」「乗り物」「スポーツ」カテゴリを追加可能な設計

---

## アーキテクチャ

### ファイル構成

```
games/
├── akinator.html          # ゲーム本体
└── akinator-data.json     # 動物データ（名前・属性・質問）
```

### データ形式（akinator-data.json）

```json
{
  "questions": [
    "ほにゅうるいですか？",
    "水の中でもくらせますか？",
    "つばさがありますか？",
    "にくをたべますか？",
    "からだがおおきいですか？（ライオンより大きい）",
    "ペットとして飼われますか？",
    "日本にすんでいますか？",
    "木にのぼれますか？",
    "はやくはしれますか？（時速30kmより速い）",
    "しまもようがありますか？",
    "からがありますか？",
    "むれでいきますか？",
    "よるにかつどうしますか？",
    "海にすんでいますか？",
    "さむいところにすんでいますか？（北極・南極など）",
    "あしが4本ありますか？",
    "しっぽがありますか？",
    "きけんな動物ですか？",
    "むしですか？",
    "ちいさいですか？（ねこより小さい）"
  ],
  "items": [
    {
      "name": "イヌ",
      "emoji": "🐕",
      "hint": "人間の親友と言われる動物",
      "attrs": [true, false, false, false, false, true, false, false, false, false, false, false, false, false, false, true, true, false, false, false]
    },
    ...
  ]
}
```

### アルゴリズム（情報量最大化・貪欲法）

```
1. 候補リスト = 全アイテム
2. 使用済み質問 = []

ループ：
  - 未使用の各質問について「候補の中で YES の割合」を計算
  - 0.5 に最も近い割合の質問を選択（情報量最大）
  - ユーザーに質問を表示
  - 答えに応じて候補をフィルタ：
      YES → attr が true のものだけ残す
      NO  → attr が false のものだけ残す
      わからない → フィルタしない（質問はスキップ）
  - 候補が1件 → 「これですか？」と提示
  - 候補が0件 → 「わかりません！」
  - 20問経過 → 最有力候補を提示
```

### 答えの選択肢（4択）

| ボタン | 意味 |
|--------|------|
| ✅ はい | YES でフィルタ |
| ❌ いいえ | NO でフィルタ |
| 🤷 たぶんそう | 「はい」と同じ扱い（重みを下げて候補スコアに加算） |
| 💭 わからない | フィルタせず次へ |

### UI フロー

```
[スタート画面]
  「なにかの動物を思い浮かべてください！」
  「かんがえたら スタート！」ボタン

    ↓

[質問画面]
  質問番号 / 20問
  ━━━━━━━━━━━━━ (プログレスバー)
  「ほにゅうるいですか？」
  [✅ はい] [❌ いいえ] [🤷 たぶんそう] [💭 わからない]
  残り候補数：45

    ↓（候補が1件 or 20問経過）

[回答画面]
  「あなたが思っていたのは...」
  🦁
  「ライオン！」
  「にくをたべる大きなほにゅうるいで、アフリカにすんでいます」
  [🎉 せいかい！] [😅 ちがう...]

    ↓

[結果画面]
  正解時：「やった！○問でわかりました！」
  不正解時：「むずかしかった！なんの動物でしたか？」
  [もう一度あそぶ]
```

---

## 動物リスト（50種・第一弾）

### 陸上哺乳類（20種）
イヌ、ネコ、ライオン、トラ、ゾウ、キリン、シマウマ、サル、ゴリラ、パンダ、クマ、ウサギ、リス、ネズミ、ウマ、ウシ、ブタ、ヒツジ、シカ、キツネ

### 鳥類（10種）
スズメ、カラス、フクロウ、ワシ、ペンギン、フラミンゴ、タカ、オウム、ツル、ニワトリ

### 水生・両生類（10種）
イルカ、クジラ、サメ、タコ、カニ、カメ、カエル、ペンギン、アザラシ、イカ

### 爬虫類・虫（10種）
ヘビ、ワニ、トカゲ、カメレオン、カブトムシ、チョウ、バッタ、アリ、ハチ、クモ

---

## 実装タスク

- [ ] akinator-data.json の作成（50種 × 20属性）
- [ ] akinator.html の UI 実装
- [ ] 情報量最大化アルゴリズムの実装
- [ ] アニメーション・演出
- [ ] index.html にカード追加
- [ ] CLAUDE.md のゲーム一覧更新

---

## デザイン方針

- 紫系グラデーション（プロジェクト統一テーマ）
- 大きなボタン（スマホ操作しやすい）
- 動物絵文字を大きく表示（画像不要・著作権フリー）
- 質問ごとにフワッとアニメーション
- 候補数バー（「のこり○ひき」表示）で絞り込み感を演出

---

## レビュー

（実装後に記録）

---

# セキュリティ対応メモ（2026-05-02）

## 実装タスク

- [x] 公開リポジトリから実運用のFirebase設定を外す
- [x] Firebase未設定でもランキング画面が安全に閉じるようにする
- [x] ノノグラムをローカル保存へフォールバックさせる
- [ ] Firestore Security Rules と App Check の実運用設定を別途確認する

## レビュー

- `games/firebase-config.js` は公開用スタブ化し、実値なしでは初期化しないようにした
- `games/ranking.js` は Firebase 無効時に共有ランキング停止メッセージを出して継続できるようにした
- `games/nonogram.html` は Firebase 無効時に localStorage 保存へ自動フォールバックするようにした

---

# かばかば（パステルカバもちわらび餅パズル）実装プラン（2026-07-20）

## 概要

ぷよぷよ風の落下・連結パズルゲーム。パステルカラーのカバモチーフのわらび餅が4つ以上つながると消える。

- ゲーム名: **かばかば**
- ファイル: `games/kabakaba.html`
- カテゴリ: `puzzle`
- アイコン: 絵文字ではなく **HTML/SVGで自前描画**（🦛は「HIPO」ゲームで使用済みのため）
- ランキング機能: **含めない**（`block-puzzle.html`と同様、localStorageのベストスコアのみ）

参照する既存パターン: `games/block-puzzle.html`（テトリス風、ゲームループ・入力処理・サウンド・UI構造が最も近い）。

## 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `games/kabakaba.html` | 新規作成 — ゲーム本体 |
| `games/games-data.js` | `GAME_PROJECT_GAMES`に1エントリ追加（SVGアイコン付き、`isNew: true`） |
| `index.html` | `makeCard()`内 `icon.textContent` → `icon.innerHTML`（SVGアイコン対応、既存絵文字は表示不変） |
| `games/common.js` | `buildDrawer()`内、アイコン+名前のリンクをspan2つに分割してinnerHTML対応 |
| `games/common.css` | `.drawer-game-icon` / `.drawer-game-label` の最小限のルール追加 |

## games-data.js 追加エントリ

```js
{ name: 'かばかば', icon: '<svg viewBox="0 0 24 24" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><circle cx="6" cy="7" r="3" fill="#c9a8e0"/><circle cx="18" cy="7" r="3" fill="#c9a8e0"/><circle cx="6" cy="7" r="1.4" fill="#efe0f7"/><circle cx="18" cy="7" r="1.4" fill="#efe0f7"/><rect x="3" y="8" width="18" height="13" rx="6.5" fill="#dcc2ef"/><ellipse cx="12" cy="16.5" rx="6" ry="4" fill="#efe0f7"/><circle cx="9" cy="14" r="1.1" fill="#5c4a70"/><circle cx="15" cy="14" r="1.1" fill="#5c4a70"/><circle cx="8" cy="10.5" r="1.6" fill="#f5eefc" opacity="0.85"/></svg>', category: 'puzzle', file: 'kabakaba.html', isNew: true },
```

## ゲームロジック設計

### グリッドとぷよペア
- 6列 × 12行（表示） + 上部2行の隠しスポーン行、セルサイズ36px（board canvas: 216×432）
- 落下ペア = 軸セル + 衛星セル（4方向オフセット）、`move(dx)` / `softDrop()` / `hardDrop()` / `rotate()`（壁蹴りキック `[0,-1,1,-2,2]` + 天井蹴りフォールバック）

### パステルカラーパレット（4色使用・5色定義）
```js
const PALETTE = {
  matcha:   { base:'#a9d98c', dark:'#7fb95e', light:'#d8f0c4', muzzle:'#eef8e2', eye:'#4a5c3a' },
  sakura:   { base:'#f5b8c8', dark:'#e389a3', light:'#fbdfe7', muzzle:'#fff0f4', eye:'#7a4a56' },
  kinako:   { base:'#e8c98a', dark:'#cda355', light:'#f6e6bf', muzzle:'#fbf3de', eye:'#6b5636' },
  mitsu:    { base:'#c9a07a', dark:'#a97c53', light:'#e3c9ad', muzzle:'#f2e2cf', eye:'#5c4530' },
  lavender: { base:'#c9a8e0', dark:'#a97fc9', light:'#e6d5f2', muzzle:'#f5eefc', eye:'#5c4a70' }
};
```

### かばセル描画（`drawHippoCell`）
Canvas primitivesのみ（影楕円→本体楕円→耳2つ→マズル楕円→鼻穴→目→光沢ハイライト）。絵文字・画像は使わない。

### ロック → 重力 → 連結判定 → 連鎖処理
1. `applyGravity()` — 各列で浮いたセルを下に詰める
2. `findGroups()` — BFS/DFSで4方向連結成分を探索
3. 4個未満のグループを除外、残りがなければ終了
4. 4個以上のグループを消去、スコア加算（`size*10*groupSizeBonus(size)*CHAIN_MULTIPLIER[chainStep]`）、メッセージ・効果音
5. 1に戻る（連鎖ループ）

### ゲームオーバー・レベル
- 新規スポーン直後に衝突していたらgame over
- `dropInterval() = Math.max(300, 900 - (level-1)*45)`

### 操作
- キーボード: ← →（移動）、↑/Z/Enter（回転）、↓（ソフトドロップ）、Space（ハードドロップ）、P（一時停止）
- モバイル: ←/↓/→/回転/落とすの5ボタン、長押しリピート（`block-puzzle.html`から流用）

### UI・サウンド
`.stats`（スコア/ベスト/さいだいれんさ/レベル）、`#board`/`#next`キャンバス、`.message-box`、`.actions`、`.how-to-play`、`.mobile-controls`をblock-puzzle.htmlのCSSパターンで構築。`unlockSound()`/`playSound(kind, chainStep)`をWebAudioオシレーターで実装（move/rotate/lock/pop/chain/pause/over）。`BEST_KEY = 'kabakaba-best'`。`common.css`/`common.js`のみ読み込み（ranking.js/firebase-config.jsは含めない）。

## 実装タスク

- [ ] `games/kabakaba.html` の新規作成（グリッド・ぷよペア・描画・連鎖ロジック・入力・サウンド・UI）
- [ ] `games/games-data.js` にエントリ追加（SVGアイコン、アイコン重複なしを確認）
- [ ] `index.html` の `makeCard()` を `innerHTML` に変更
- [ ] `games/common.js` の `buildDrawer()` をspan分割に変更
- [ ] `games/common.css` に `.drawer-game-icon` / `.drawer-game-label` を追加
- [ ] ローカルサーバーで動作確認（トップページ表示・☰メニュー・実プレイ・モバイル操作・ベストスコア永続化）
- [ ] `games/` の `.html` 数と `games-data.js` のエントリ数の整合確認

## レビュー

（実装後に記録）
