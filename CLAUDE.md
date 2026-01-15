# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

睡眠記録アプリ（PWA）。就寝時間・起床時間、コーヒー摂取、入浴、服薬を記録。

## 開発コマンド

```bash
# 開発サーバー起動
bun dev

# ビルド（TypeScript チェック含む）
bun run build

# リント
bun run lint
bun run lint:fix  # 自動修正

# フォーマット
bun run format
bun run format:fix  # 自動修正

# リント + フォーマット一括チェック/修正
bun run check
bun run check:fix
```

## 技術スタック

- React 19 + TypeScript
- Vite 7 + vite-plugin-pwa
- Tailwind CSS v4
- Biome（リンター/フォーマッター）
- bun（パッケージマネージャー）

## アーキテクチャ

### 状態管理

- `App.tsx` がルートコンポーネントとして全体の状態を管理
- `localStorage` による永続化（`src/utils/sleepStorage.ts`）
  - 睡眠記録: `sleep:YYYY-MM-DD` キーで保存
  - 一時データ: `pending-bed-time`, `pending-medication` キー

### 画面遷移

1. メイン画面 → 「これから寝る」で就寝待機画面
2. 就寝待機画面 → 起床時に記録フォーム表示
3. フォーム保存 → メイン画面に戻る

### コンポーネント構成

- `PreSleepActions`: 就寝前アクション（服薬ボタン、就寝ボタン）
- `SleepWaitingScreen`: 就寝待機画面（時間調整可能）
- `SleepForm`: 睡眠記録入力フォーム
- `RecordsList`: 過去の記録一覧
- `MedicationModal`: 服薬時間入力モーダル

## Biome 設定

- インデント: タブ
- クォート: ダブルクォート
- import 自動整理: 有効

# zzz / Coding Agent Minimal Guidelines

## プロジェクト概要
- 個人用の睡眠記録PWA
- 目的は「毎日、無理なく記録が続くこと」
- 高機能より **使っていて気持ちいい体験** を最優先
- 現時点では Web（PWA）完結

---

## 最重要な判断基準

### 1. ユーザーに考えさせない
- 日付・画面遷移・状態は極力自動
- 「これで合ってる？」と迷うUIは避ける
- 設定項目は増やさない

### 2. 通常フローを壊さない
- 基本フロー：
  - 夜：これから寝る
  - 朝：起きたら記録
  - 昼：ホーム（一覧）

### 3. 状態 × 時間で画面を決める
- ルーティングより状態管理ベース
- 「今、ユーザーが一番やりたいこと」を表示する

---

## 日付ルール（重要）

- 睡眠は **起床した日** に属する
- 通常フローでは日付は自動決定
- 日付変更は例外操作
  - ヘッダー日付タップなど控えめな入口
  - 明示的に「日付を変更する」文脈を作る

---

## UIポリシー

- シンプル・低情報密度
- 何もしなくても成立する画面を目指す
- input UI はネイティブ標準を優先
  - `<input type="time">` など
- カスタムUIは後回し

---

## 実装方針

- 状態管理は最小限
- 差し替えやすい構造を意識する
- ライブラリ追加は慎重に

---

## 今回やらないこと

- 複雑な設定画面
- カスタム日付・時間ピッカー
- 分析・グラフ・スコア
- ネイティブ専用機能（ウィジェット等）

---

## Claude Code への指示

- セッション中に重要な判断・方針が決まったら、会話の最後に「CLAUDE.md に追記する？」と確認する
- 追記するのは**判断基準・方針・やらないこと**であり、実装詳細ではない
