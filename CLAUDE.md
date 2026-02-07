# Game Project

小学生向けのWebゲームコレクション。ブラウザだけで遊べる楽しいゲームを集めたプロジェクト。

## ターゲット

小学生

## 公開環境

- **GitHub Pages**で公開（静的サイトホスティング）
- 公開サイトではHTML、CSS、JavaScriptのみ動作
- 外部データが必要な場合は、事前にJSONファイル等を生成してアップロード

## 開発環境

- ローカルマシン または iOSアプリの Claude Code からプロンプトで開発
- ローカルマシンの場合：Python等でデータ生成スクリプトの実行が可能
- iOSアプリの場合：プロンプト指示のみ（ローカルプログラム実行は不可）

## ゲーム一覧

※ 今後も追加予定

| ゲーム | ファイル | 説明 |
|--------|----------|------|
| 2048 | `games/2048.html` | 数字タイルを結合して2048を目指すパズル |
| マルバツ | `games/tic-tac-toe.html` | 3目並べ対戦ゲーム |
| インベーダー | `games/invader.html` | 敵を撃ち落とすシューティング（Canvas使用） |
| リバーシ | `games/reversi.html` | CPU対戦も可能なボードゲーム |
| 将棋 | `games/shogi.html` | 動ける場所が光る初心者向け将棋 |
| ポケモンしりとり | `games/pokemon-shiritori.html` | ポケモンの名前でしりとり対決（pokemon-data.json使用） |
| お絵かきロジック | `games/nonogram.html` | 数字のヒントでマスを塗って絵を完成させるノノグラムパズル |
| スライドパズル | `games/sliding-puzzle.html` | 動物イラストを完成させるスライドパズル |

## 技術スタック

- HTML5 / CSS3 / JavaScript
- Canvas API（インベーダー）
- localStorage（ゲーム履歴・スコア保存）
- Firebase / Firestore（ランキング機能）
- モバイル・デスクトップ両対応
- 外部ライブラリの使用可

## アーキテクチャ

### ゲームの仕組み

1. **ゲーム一覧（index.html）**
   - 全ゲームへのリンクを表示
   - `gameHistory`をlocalStorageに記録して、最近プレイしたゲームを上に表示

2. **各ゲーム（games/*.html）**
   - 独立した単一HTMLファイル
   - `common.js`と`common.css`を読み込み
   - game-listへの戻るリンクが自動挿入される
   - `common.js`によってアクセス時刻がlocalStorageに記録される

3. **データ永続化**
   - **ローカル保存**: localStorage（スコア、ゲーム履歴）
   - **クラウド保存**: Firebase Firestore（ランキング、全プレイヤーデータ）

4. **外部データ**
   - **pokemon-data.json**: PokeAPIから事前に生成・保存したデータ
   - games/フォルダに静的ファイルとして配置
   - ゲーム起動時に読み込まれる（実行時のAPI呼び出しなし）

### 主要な設計パターン

- **IIFE（即座関数実行）**: `common.js`の実装パターン
- **静的ファイルオンリー**: GitHub Pagesで動作するため、APIサーバーなし
- **クライアントサイド処理**: すべてのゲームロジックはブラウザで実行

## プロジェクト構造

```
game-project/
├── index.html                    # ゲーム選択ポータル
├── games/
│   ├── *.html                    # 各ゲームファイル
│   ├── common.css                # 共通スタイル
│   ├── common.js                 # 共通スクリプト（ナビ自動挿入）
│   ├── ranking.js                # ランキング機能（Firebase）
│   ├── ranking.css               # ランキング画面のスタイル
│   ├── firebase-config.js         # Firebase設定
│   └── pokemon-data.json          # ポケモン名データ（PokeAPI由来）
├── scripts/
│   └── fetch-pokemon.js           # PokeAPIからポケモンデータを取得するスクリプト
└── CLAUDE.md                      # このファイル
```

### 共通ファイルについて

- **common.css**: 背景色、ボタン、ナビゲーション等の共通スタイル
- **common.js**: 各ゲームページに「← ゲーム一覧」リンクを自動挿入・アクセス履歴を記録

### ランキング機能について

- **ranking.js / ranking.css**: Firebase Firestoreを使用したゲームのスコアランキング機能
- **firebase-config.js**: Firebase認証とFirestore接続設定
- 各ゲームは独立してランキングデータをFirestoreに保存・読み込み可能

### ポケモンデータについて

- **pokemon-data.json**: PokeAPIから取得した全ポケモンの日本語名リスト
- **fetch-pokemon.js**: Node.js実行スクリプト。PokeAPIから最新データを取得して`pokemon-data.json`を生成
  - 実行方法: `node scripts/fetch-pokemon.js`

新しいゲームを追加する際は、以下を`<head>`内に追加：
```html
<link rel="stylesheet" href="common.css">
<script src="common.js" defer></script>
```

ランキング機能を使用する場合は、`firebase-config.js`と`ranking.js`も読み込み：
```html
<script src="firebase-config.js" defer></script>
<script src="ranking.js" defer></script>
```

## デザイン

- 統一された紫系グラデーションテーマ
- 楽しいアニメーション・エフェクト
- 完全日本語対応
- 各ゲームに「← ゲーム一覧」リンクを設置（index.htmlへ戻れるように）

## ローカル開発

### ローカルテスト環境の起動

GitHub Pagesと同じく静的ファイルのみを提供するため、簡単なHTTPサーバーで動作確認：

```bash
# Python 3をインストール済みの場合
python3 -m http.server 8000

# Python 2の場合
python -m SimpleHTTPServer 8000

# または Node.js http-server を使用
npm install -g http-server
http-server
```

ブラウザで `http://localhost:8000` にアクセスして確認。

### ポケモンデータの更新

PokeAPIのデータを最新に保つ場合：

```bash
node scripts/fetch-pokemon.js
```

このスクリプトは全ポケモンの日本語名を`games/pokemon-data.json`に保存します。実行にはNode.jsが必要。

## 開発の流れ

### 使用するツール

- **Claude Code**（sonnetモデル）を使用

### 変更の反映方法

**ローカルマシンから開発する場合：**
- mainブランチに直接プッシュしてOK

**iOSアプリから開発する場合：**
1. Claudeが作業用ブランチで変更を作成
2. GitHubで「プルリクエスト」画面が作られる
   - 変更内容を確認できる画面です
   - **PRコメントにはわかりやすい説明を記載すること**
3. 確認してOKなら「Merge」ボタンを押す
   - これで本番（main）に反映されます

### GitHubでの確認方法

1. GitHubのリポジトリページを開く
2. 「Pull requests」タブをクリック
3. 一覧から確認したい変更を選ぶ
4. 内容を見て問題なければ「Merge pull request」→「Confirm merge」

### ゲーム追加時の確認事項

新しいゲームの作成リクエストを受けたら、作業前に以下を確認：

1. **著作権・商標の確認**
   - キャラクターや名前が他社の権利を侵害しないか
   - 権利者のガイドラインを確認し、非商用・教育目的で許容される範囲であればOK
   - 例：PokeAPIのスプライト画像は非商用ファンプロジェクトで広く使用されており許容
2. **セキュリティの確認**
   - 外部サイトへの不正なデータ送信がないか
   - 悪意のあるコード（ウイルスなど）が含まれないか
3. **年齢適正の確認**
   - 小学生向けとして不適切な内容（暴力・ギャンブルなど）がないか

問題がある場合は、作業前にユーザーに確認・相談する。

### ⚠️ ゲーム追加・変更時の必須チェック（index.html整合性）

新しいゲームを追加したり、`index.html`を変更するPRを作成する際は、**必ず最新のmainブランチを取り込んでから**作業すること。

**背景**: 過去に、複数のゲーム追加PRが並行して作られた際、後からマージされたPRが先にマージされたゲームのリンクを`index.html`から消してしまう事故が発生した（ノノグラムのリンク消失）。

**対策**:
1. **PRを作る前に`main`を取り込む**: `git pull origin main` または `git merge origin/main` を実行して、最新の`index.html`を反映する
2. **`index.html`のゲームリンク数を確認**: `games/`フォルダ内の`.html`ゲームファイル数と、`index.html`内のゲームカード数が一致しているか確認する
3. **既存ゲームのリンクが消えていないか確認**: `git diff origin/main -- index.html` で、意図しない削除がないかチェックする

### フィードバック対応

ユーザーからフィードバックを受けたら：
1. 対応を実施
2. **「この内容をCLAUDE.mdに追加しますか？」と確認する**
   - 今後も適用すべきルールや方針はCLAUDE.mdに追記

### 用語メモ

| 用語 | 意味 |
|------|------|
| main | 本番の場所。ここが公開される |
| ブランチ | 作業用の別の場所。mainを壊さずに試せる |
| プルリクエスト(PR) | 「この変更を反映していい？」という確認画面 |
| マージ | 変更をmainに取り込むこと |
