# 小学生向けWebゲームコレクション

ブラウザだけで遊べるゲーム集。パズル・ボードゲーム・カードゲーム・占いなど多数収録。

## 遊ぶ

https://kiyohero.github.io/game-project/

## ローカル開発

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` にアクセス。

## 技術スタック

- HTML5 / CSS3 / JavaScript（外部ライブラリ最小限）
- Canvas API・localStorage・Firebase Firestore（ランキング機能・任意）
- GitHub Pages（静的サイトホスティング）

## 新しいゲームの追加

`games/` に HTML ファイルを追加し、`index.html` にカードを追加。
`<head>` に `common.css` と `common.js` を読み込むこと。詳細は `CLAUDE.md` を参照。

## データ基盤

外部サービスなしでランキング・診断結果共有を実現する2つのシステムが組み込まれています。

### ランキング機能（GithubDB）

`games/github-db.js` + `games/github-config.js` で有効化。  
スコアを `kiyohero/game-ranking` リポジトリに GitHub Contents API 経由で保存します。

**新しいゲームにランキングを追加する：**
```html
<!-- HTMLの <head> に追加 -->
<script src="github-config.js" defer></script>
<script src="github-db.js" defer></script>
<script src="ranking.js" defer></script>
```

```javascript
// ゲーム終了時（スコア登録ダイアログを表示）
Ranking.showSubmitModal('game-id', score, function() {
  // 登録後の処理
});

// ランキング表示ボタンから
Ranking.showRankingModal('game-id', currentScore);
```

`game-id` は `rankings/{game-id}.json` のファイル名になります（例: `'2048'`, `'invader'`）。

### 診断結果URLシェア（ShareResult）

`games/share-result.js` で有効化。  
診断結果をURLパラメータにエンコードして共有できます。

**新しい診断ゲームに追加する：**
```html
<!-- HTMLの <head> に追加 -->
<script src="share-result.js" defer></script>
```

```javascript
// 結果表示後にシェアボタンを追加
ShareResult.renderShareButton(container, { type: 'INTJ' });

// ページロード時にURLから結果を復元
const shared = ShareResult.getFromUrl('r');
if (shared) showResult(shared);
```
