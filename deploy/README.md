# 東軽井沢市 公式ポータルサイト

> 静けさを、未来へ。 — Quiet, by design.

架空自治体「東軽井沢市」の都市ブランドサイト。トップページ完成版。

## 公開方法（GitHub Pages）

1. このフォルダの中身（index.html / support.js / image-slot.js / img/ / .nojekyll）を
   リポジトリのルート（または docs/）に配置
2. Settings → Pages → Source を該当ブランチ／フォルダに設定
3. 数分後、https://<ユーザー名>.github.io/<リポジトリ名>/ で公開されます

そのままダブルクリックで開いても動作します（フォントのみ Google Fonts から読み込み）。

## ファイル構成

- index.html ........ サイト本体（コンポーネント定義を含む）
- support.js ........ 描画ランタイム
- image-slot.js ..... 画像差し替え用スロット
- img/ .............. 写真素材（14点）
- .nojekyll ......... GitHub Pages の Jekyll 処理を無効化

## 機能

- ヒーロー＋全10セクション（まち / 数字 / 四季 / 暮らす / 働く / 遊ぶ / 市民 / ニュース / イベント / ようこそ）
- ダークモード（システム連動・手動切替・保存）
- スクロール連動フェードイン・数字カウントアップ・パララックス・グラスモーフィズム
- レスポンシブ（スマホ最優先）／四季4列・遊ぶ3列の整列レイアウト
- アクセシビリティ対応（スキップリンク・ランドマーク・aria・reduced-motion）
- SEO（meta / OGP / JSON-LD 構造化データ）

## 画像の差し替え

img/ 内のファイルを同名で置き換えるだけで反映されます。
（四季：spring/summer/autumn/winter、遊ぶ：onsen/greenway/cycling/museum/science/nightview、
　市民：resident-morning/afternoon/evening、働く：interview ほか）

---
本サイトに登場する企業・人物・施設はすべて架空のものです。
(c) 2026 東軽井沢市役所 都市戦略部 都市ブランド室
