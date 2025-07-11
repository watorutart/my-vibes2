# Rogue - Classic Dungeon Crawler

HTML5/JavaScriptで作られたクラシックなローグライクゲームです。1980年代の名作「Rogue」を現代のブラウザで再現しました。

## ゲームの特徴

### 🗡️ 完全なローグライク体験
- **ランダムダンジョン**: 毎回異なるダンジョンレイアウト
- **ターンベース**: 戦略的な思考が重要
- **ASCII文字**: クラシックなテキストベース表示
- **パーマデス**: 死んだらゲームオーバー

### 🏰 ダンジョン探索
- **部屋と廊下**: 自動生成される複雑な構造
- **階層システム**: 深い階層ほど危険
- **隠された宝物**: 各階層に散らばるアイテム
- **階段**: 「>」記号で次の階層へ

### ⚔️ 戦闘システム
- **近接戦闘**: 敵に隣接して攻撃
- **ダメージ計算**: 攻撃力 - 防御力 + 乱数
- **装備効果**: 武器と防具が戦闘に影響
- **敵AI**: プレイヤーを追跡する知能

### 👹 多様な敵キャラクター
- **ネズミ (r)**: 弱い初心者向けの敵
- **ゴブリン (g)**: 中程度の脅威
- **オーク (o)**: 強力な戦士
- **トロル (T)**: 高い体力と攻撃力
- **ドラゴン (D)**: 最強の敵

### 🎒 充実したアイテムシステム
#### 武器 (Symbol: ))
- **ダガー**: 攻撃力+3
- **ショートソード**: 攻撃力+5  
- **ロングソード**: 攻撃力+8
- **バトルアックス**: 攻撃力+12
- **マジックソード**: 攻撃力+15

#### 防具 (Symbol: ])
- **レザーアーマー**: 防御力+2
- **チェインメイル**: 防御力+4
- **プレートメイル**: 防御力+6
- **マジックアーマー**: 防御力+10

#### ポーション (Symbol: !)
- **回復ポーション**: HP +10回復
- **力のポーション**: 攻撃力 +2
- **守りのポーション**: 防御力 +2

#### その他
- **食料 (%)**: 飢餓を回復
- **ゴールド (*)**: 得点システム

## 操作方法

### 基本移動
- **WASD** または **矢印キー**: 8方向移動
- **E**: アイテム拾得
- **Space**: 待機（ターンをスキップ）
- **R**: 休憩（HP回復）
- **I**: インベントリ表示

### ゲームプレイ
- 敵に隣接すると自動的に攻撃
- アイテムをクリックして使用
- 階段（>）に乗って次の階層へ
- 食料が0になると飢餓ダメージ

## ゲームシステム

### レベルアップ
- 敵を倒すと経験値獲得
- レベルアップでHP、攻撃力、防御力が上昇
- より強い敵ほど多くの経験値

### 生存システム
- **飢餓**: 毎ターン食料が減少
- **体力**: 戦闘や飢餓でダメージ
- **休憩**: 安全な時にHP回復可能

### 装備システム
- 武器と防具を自動装備
- より良い装備で古い物と交換
- 装備効果は即座に反映

## UI情報

### プレイヤー統計
- **Level**: 現在のレベル
- **HP**: 体力（現在/最大）
- **XP**: 経験値（現在/次レベル）
- **Strength**: 基本攻撃力
- **Defense**: 基本防御力
- **Gold**: 所持金
- **Food**: 食料残量
- **Floor**: 現在の階層

### メッセージログ
- 戦闘結果（赤色）
- アイテム取得（黄色）
- システム情報（青色）

## ASCII記号一覧

| 記号 | 意味 |
|------|------|
| @ | プレイヤー |
| # | 壁 |
| . | 床 |
| > | 階段（下り） |
| r,g,o,T,D | 敵キャラクター |
| ) | 武器 |
| ] | 防具 |
| ! | ポーション |
| % | 食料 |
| * | ゴールド |

## 戦略とコツ

### 初心者向け
1. **慎重に行動**: 一度に複数の敵と戦わない
2. **装備を整える**: 武器と防具は必須
3. **食料管理**: 飢餓は致命的
4. **休憩活用**: 安全な場所でHP回復

### 上級者向け
1. **敵の誘導**: 狭い通路で1対1に持ち込む
2. **アイテム管理**: ポーションは緊急時に使用
3. **探索優先**: 全ての部屋をチェック
4. **リスク計算**: 逃げることも重要

## 技術仕様

### 開発技術
- **HTML5**: 構造とレイアウト
- **CSS3**: ASCII文字の色分けとスタイリング
- **JavaScript ES6**: ゲームロジックとAI

### アルゴリズム
- **BSP木**: 部屋生成アルゴリズム
- **A***: 敵のパスファインディング
- **ランダム生成**: アイテムと敵の配置

## プレイ方法

`index.html`をブラウザで開いてください。

## 今後の拡張予定

- 魔法システム
- より複雑なダンジョン生成
- ボスモンスター
- セーブ機能
- 音響効果

真のローグライク体験をお楽しみください！