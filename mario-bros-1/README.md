# Super Mario Bros 1

HTML5/JavaScriptで作られたクラシックなスーパーマリオブラザーズの再現版です。

## ゲームの特徴

### 🎮 完全な横スクロールアクション
- 滑らかなマリオの移動とジャンプ
- 重力と物理演算システム
- カメラ追従とパララックス効果

### 🏗️ クラシックなレベルデザイン
- **ブロック**: 地面、レンガ、ハテナブロック
- **パイプ**: 緑のワープパイプ
- **プラットフォーム**: 様々な高さの足場
- **背景**: 雲と丘のパララックス背景

### 👹 敵キャラクター
- **クリボー**: 茶色のキノコ型の敵
- **ノコノコ**: 緑の亀の敵
- 敵を踏んで倒すとスコア獲得
- 横から触れるとダメージ

### 🍄 パワーアップシステム
- **スーパーキノコ**: チビマリオ → スーパーマリオ
- **ファイアフラワー**: スーパーマリオ → ファイアマリオ
- パワーアップで体力とサイズが変化

### 🎯 ゲームシステム
- **スコア**: 敵を倒すと得点
- **ライフ**: 3機からスタート
- **タイマー**: 制限時間400秒
- **無敵時間**: ダメージ後の無敵状態

## 操作方法

### キーボード操作
- **移動**: A/D キーまたは ←/→ 矢印キー
- **ジャンプ**: W キーまたは ↑ 矢印キー  
- **しゃがむ**: S キーまたは ↓ 矢印キー

### ゲームプレイ
- 敵の上からジャンプして踏みつけて倒す
- 横から敵に触れるとダメージ
- ハテナブロック（？）を下から叩くとアイテム出現
- 制限時間内にできるだけ高得点を目指す

## ゲーム要素

### マリオの状態
1. **チビマリオ**: 初期状態、1回のダメージでミス
2. **スーパーマリオ**: キノコで変身、1回のダメージでチビマリオに
3. **ファイアマリオ**: フラワーで変身、ファイアボール射撃可能

### 敵の種類
- **クリボー**: 一方向に歩く、踏むと倒せる
- **ノコノコ**: 甲羅に隠れる亀、踏むと甲羅状態に

### アイテム
- **スーパーキノコ**: マリオをパワーアップ（1000点）
- **ファイアフラワー**: ファイア能力付与（1000点）
- **コイン**: スコアアップ（今後実装予定）

## 技術仕様

### 開発技術
- **HTML5**: 構造とUI
- **CSS3**: スタイリングとアニメーション  
- **JavaScript ES6**: ゲームロジックと物理演算

### ゲームエンジン機能
- リアルタイム物理演算
- コリジョン（当たり判定）システム
- カメラスクロールとパララックス
- DOM要素ベースのレンダリング

### パフォーマンス最適化
- 画面外オブジェクトの非表示
- 効率的なコリジョン検出
- 60FPS ゲームループ

## プレイ方法

`index.html`をブラウザで開いてください。

## 今後の拡張予定

- コイン収集システム
- より多くの敵とアイテム
- 複数ステージ
- ファイアボール射撃
- 音響効果とBGM
- より精密な物理演算

クラシックなマリオの体験をお楽しみください！