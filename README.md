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
