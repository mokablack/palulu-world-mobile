# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

\## ワークフロー設計



\### 1. Planモードを基本とする

\- 3ステップ以上 or アーキテクチャに関わるタスクは必ずPlanモードで開始する

\- 途中でうまくいかなくなったら、無理に進めずすぐに立ち止まって再計画する

\- 構築だけでなく、検証ステップにもPlanモードを使う

\- 曖昧さを減らすため、実装前に詳細な仕様を書く



\### 2. サブエージェント戦略

\- メインのコンテキストウィンドウをクリーンに保つためにサブエージェントを積極的に活用する

\- リサーチ・調査・並列分析はサブエージェントに任せる

\- 複雑な問題には、サブエージェントを使ってより多くの計算リソースを投入する

\- 集中して実行するために、サブエージェント1つにつき1タスクを割り当てる



\### 3. 自己改善ループ

\- ユーザーから修正を受けたら必ず `tasks/lessons.md` にそのパターンを記録する

\- 同じミスを繰り返さないように、自分へのルールを書く

\- ミス率が下がるまで、ルールを徹底的に改善し続ける

\- セッション開始時に、そのプロジェクトに関連するlessonsをレビューする



\### 4. 完了前に必ず検証する

\- 動作を証明できるまで、タスクを完了とマークしない

\- 必要に応じてmainブランチと自分の変更の差分を確認する

\- 「スタッフエンジニアはこれを承認するか？」と自問する

\- テストを実行し、ログを確認し、正しく動作することを示す



\### 5. エレガントさを追求する（バランスよく）

\- 重要な変更をする前に「もっとエレガントな方法はないか？」と一度立ち止まる

\- ハック的な修正に感じたら「今知っていることをすべて踏まえて、エレガントな解決策を実装する」

\- シンプルで明白な修正にはこのプロセスをスキップする（過剰設計しない）

\- 提示する前に自分の作業に自問自答する



\### 6. 自律的なバグ修正

\- バグレポートを受けたら、手取り足取り教えてもらわずにそのまま修正する

\- ログ・エラー・失敗しているテストを見て、自分で解決する

\- ユーザーのコンテキスト切り替えをゼロにする

\- 言われなくても、失敗しているCIテストを修正しに行く



---



\## タスク管理



1\. \*\*まず計画を立てる\*\*：チェック可能な項目として `tasks/todo.md` に計画を書く

2\. \*\*計画を確認する\*\*：実装を開始する前に確認する

3\. \*\*進捗を記録する\*\*：完了した項目を随時マークしていく

4\. \*\*変更を説明する\*\*：各ステップで高レベルのサマリーを提供する

5\. \*\*結果をドキュメント化する\*\*：`tasks/todo.md` にレビューセクションを追加する

6\. \*\*学びを記録する\*\*：修正を受けた後に `tasks/lessons.md` を更新する



---



\## コア原則



\- \*\*シンプル第一\*\*：すべての変更をできる限りシンプルにする。影響するコードを最小限にする。

\- \*\*手を抜かない\*\*：根本原因を見つける。一時的な修正は避ける。シニアエンジニアの水準を保つ。

\- \*\*影響を最小化する\*\*：変更は必要な箇所のみにとどめる。バグを新たに引き込まない。





## 基本方針
playwritghtを使用したデバック時に作成されたファイルは、C:\Users\mirai\Documents\my_app\palulu-world-mobile\.playwright-mcpにデバックした日時を記載したフォルダを作り、格納するようにする。

## Project Overview

**ぱるるワールドMobile** is a Japanese mobile-first browser-based board game (双六). Modes:

- **Board Editor** — design custom boards with a tile palette
- **Single-player** — solo play
- **Local Multiplayer** — 2–12 players on the same device
- **Online Multiplayer** — Firebase-backed room system (partially implemented)

No build tooling. Open `index.html` directly in any browser.

---

## Architecture

**No build tooling** — open `index.html` directly in any browser. No npm, no build step, no tests.

**GitHub Pages:** https://mokablack.github.io/palulu-world-mobile/

### File Structure

```
index.html        (~216 lines) — HTML skeleton only
css/
  styles.css      (~761 lines) — all styles
js/
  game.js         (~3827 lines) — all game logic
tasks/
  todo.md         — タスク一覧（作業ごとに作成）
  lessons.md      — 修正パターンの記録（自己改善ループ用）
```

`index.html` loads Font Awesome 6.7.2 CDN, `css/styles.css`, Firebase SDK v11 Compat CDN (3 scripts: `firebase-app-compat`, `firebase-auth-compat`, `firebase-database-compat`), then `js/game.js`.

### `js/game.js` Section Order (delimited by `// ========== ... ==========`)

1. データ定義 — `TILE_TYPES`, `ITEMS`, `EVENTS`, `escapeHtml()`, `itemLabel()`
2. ゲーム状態 — `gameState`
3. 初期化 — `init()`
4. Firebase設定
5. ボード管理 — `initializeBoard()`, `renderBoard()`
6. パレット — tile palette UI
7. アイテム管理
8. イベント管理
9. ステージ保存/読み込み — localStorage
10. モード切り替え — `switchMode()` + `ALL_MODES` table
11. プレイヤー設定
12. ゲーム開始 — `startSinglePlay()`, `startLocalMulti()`
13. オンラインマルチ (Firebase実装)
14. ゲームプレイ — dice, movement, tile effects
15. アイテム取得共通処理
16. 逆さまスプレー / コシンドスプレー / バベル / 呪われた人形 / スナッチャー / トンカチ / 形代＋下剋上ハンドラ / 釘＋トンカチコンボ / 釘の設置 / 諸刃の剣 (`morohajokenTarget()`) (per-item handlers)
17. 怪しい商人UI — `showMerchantDialog()` and related
18. モーダル — `showModal()`, `buildResultText()`, `nextTurn()`
19. 自分をアピールして！ / 好きなだけ進んでいいよ / 今日のラッキーナンバーは？ / 怒らせたら10進む (custom event UIs)
20. イベント委譲ディスパッチャー — `closeModal*` bridge functions, `ACTION_HANDLERS`, `document.addEventListener('click', ...)`, `init()` call

---

## Data Model

### `gameState`

```javascript
let gameState = {
    // Editor
    mode: 'editor',                     // 'editor' | 'single' | 'local' | 'online'
    gridSize: { rows: 5, cols: 5 },
    board: [],
    selectedTileType: TILE_TYPES.NORMAL,
    enabledItems: {},                   // { [itemId]: boolean }
    selectedEventForTile: null,
    editingTileIndex: null,

    // Gameplay
    playMode: null,                     // 'single' | 'local' | 'online'
    players: [],
    currentPlayerIndex: 0,
    diceValue: 1,
    isRolling: false,
    winShown: false,
    nailTraps: {},                      // { [tileIndex]: placingPlayerIndex }

    // Item effect flags (active for current turn)
    bootsActive: false,
    binocularsActive: false,
    koshindoActive: false,
    sakasamaActive: false,

    // Firebase
    firebaseConfig: null,
    firebaseInitialized: false,
    roomId: null,
    playerId: null,
    isHost: false,
    firebaseRefs: {}
};
```

### Tile object

```javascript
{
    id: 'normal' | 'forward' | 'backward' | 'item' | 'event' | 'rest' | 'start' | 'goal',
    name: string,
    color: string,          // CSS class e.g. 'tile-normal'
    effect: null | {
        type: 'move' | 'item' | 'event' | 'rest',
        value?: number,
        eventId?: string,
        eventTitle?: string,
        eventText?: string,
        eventEffect?: number | 'merchant' | 'extraTurn' | 'skip' | 'storm'
                    | 'blackhole' | 'whitehole' | 'mask' | 'average'
                    | 'forceend' | 'nameback' | 'ganbare' | 'resetall' | 'newstart'
                    | 'angry' | 'self_appeal' | 'freemove' | 'luckynumber'
    }
}
```

### Player object

```javascript
{
    name: string,
    position: number,       // Index into gameState.board
    items: string[],        // Collected item IDs
    skipTurns: number,      // Turns remaining to skip (0 = no skip)
    immuneTurns: number,    // Turns remaining with negative-effect immunity (max 3)
    babelTarget: number | null  // Player index for バベル item effect
}
```

### Constants

```javascript
const TILE_TYPES = { NORMAL, FORWARD, BACKWARD, ITEM, EVENT, REST, START, GOAL };
// REST: { id: 'rest', name: '休み', color: 'tile-rest', effect: { type: 'rest', value: 1 } }

// Items (16 total) — each has id, name, icon (emoji), effect (string)
const ITEMS = [
    { id: 'boots',       name: '魔法の靴',         icon: '👟', ... },
    { id: 'shield',      name: '盾',               icon: '🛡️', ... },  // reactive: prompted on backward tile
    { id: 'binoculars',  name: '双眼鏡',           icon: '🔭', ... },
    { id: 'timestop',    name: 'タイムストップ',   icon: '⏸️', ... },
    { id: 'koshindo',    name: 'コシンドスプレー', icon: '💨', ... },
    { id: 'sakasama',    name: '逆さまスプレー',   icon: '🔄', ... },
    { id: 'star',        name: 'スター',           icon: '⭐', ... },
    { id: 'curseddoll',  name: '呪われた人形',     icon: '🧸', ... },
    { id: 'babel',       name: 'バベル',           icon: '🌀', ... },  // displayed as star externally
    { id: 'snatcher',    name: 'スナッチャー',     icon: '🎣', ... },  // 他プレイヤーのアイテムを1つ奪う
    { id: 'nail',        name: '釘',               icon: '📌', ... },
    { id: 'hammer',      name: 'トンカチ',         icon: '🔨', ... },
    { id: 'katashiro',   name: '形代',             icon: '🪆', ... },  // 受動アイテム: 攻撃効果を第三者に転嫁
    { id: 'gekokujo',    name: '下剋上',           icon: '⚔️', ... },  // トップと位置交換（全アイテム失う）
    { id: 'kagemaiha',   name: '影舞葉',           icon: '🍃', ... },
    { id: 'morohajoken', name: '諸刃の剣',         icon: '🗡️', ... },  // 100面ダイス: 1→ゴール1マス前, 他→スタートへ; 同マスの他PLにも使用可
];

// Events (19 total)
const EVENTS = [
    { id: 'merchant',    effect: 'merchant'    },  // 3択アイテム選択UI
    { id: 'wind',        effect: -2            },
    { id: 'goddess',     effect: 'extraTurn'   },
    { id: 'pit',         effect: 'skip'        },
    { id: 'tailwind',    effect: 3             },
    { id: 'storm',       effect: 'storm'       },
    { id: 'blackhole',   effect: 'blackhole'   },
    { id: 'whitehole',   effect: 'whitehole'   },
    { id: 'mask',        effect: 'mask'        },  // 別の覆面マスへワープ
    { id: 'average',     effect: 'average'     },  // 全員同じマスへ
    { id: 'forceend',    effect: 'forceend'    },  // 強制ゲーム終了
    { id: 'nameback',    effect: 'nameback'    },  // 名前文字数分戻る
    { id: 'ganbare',     effect: 'ganbare'     },  // 見出しのみ表示（本文なし）
    { id: 'resetall',    effect: 'resetall'    },  // 全員スタートへ
    { id: 'newstart',    effect: 'newstart'    },  // 盤面再構成
    { id: 'angry',       effect: 'angry'       },  // ルーレット→選ばれたPが進む/戻る
    { id: 'self_appeal', effect: 'self_appeal' },  // 30秒アピール→他PL投票で進む
    { id: 'freemove',    effect: 'freemove'    },  // 任意のマス数入力して前進
    { id: 'luckynumber', effect: 'luckynumber' },  // 数値入力→ランダム効果
];
```

---

## Key Functions

| Function | Purpose |
|---|---|
| `init()` | Entry point on page load |
| `escapeHtml(str)` | XSS-safe HTML escaping — use for all user input embedded in `innerHTML` |
| `itemLabel(itemId)` | Returns `"icon name"` string for display; resolves `babel`→`star` |
| `switchMode(mode)` | Navigate between editor / items / events / play screens via `ALL_MODES` table |
| `initializeBoard()` | Reset board to default |
| `renderBoard()` | Re-render board grid from `gameState.board`; shows FA icons for item/blackhole/whitehole tiles |
| `generateRandomStage()` | Generate a random board (~30% normal / ~30% item / ~40% event) |
| `saveStage()` / `loadStage()` | Persist/restore board to localStorage |
| `startSinglePlay()` / `startLocalMulti()` | Transition to active gameplay |
| `rollDice()` | Animate dice and compute movement |
| `movePlayer(steps)` | Advance current player with step-by-step animation |
| `executeTileEffect(tile)` | Evaluate effect on landing; checks immunity + curseddoll first |
| `handleEvent(eventEffect)` | Dispatch event effects including all new event types |
| `showMerchantDialog()` | 3択アイテム選択UI for 怪しい商人 event; each offer has 25% chance of being fake (消滅) |
| `useKagemaiha()` | Move to 1-rank-above player's tile, apply tile effect without dice |
| `useGekokujo()` | Swap position with top-ranked opponent; calls `applyGekokujoSwap()` |
| `applyGekokujoSwap(targetIndex, katashiroUsed, originalTopIndex, backSteps?)` | Execute the position swap; handles katashiro interception |
| `findTopOpponentIndex(playerIndex)` | Return index of highest-ranked opponent relative to given player |
| `applyMoveEffect(moveValue)` | Shared helper — shows modal then applies forward/backward movement |
| `useShield(itemIndex)` | Consume shield from inventory; block backward tile effect |
| `shieldSkipAndMove(moveValue)` | Decline shield use; apply backward movement normally |
| `promptKatashiroChoice(context)` | Show 形代 intercept dialog when attacked player holds katashiro |
| `nextTurn()` | Advance turn; handles skip, nailPlacement prompt |
| `showModal(type, message, callback?, titleOverride?)` | `type`: `'info'` \| `'win'` \| `'vanished'`; `titleOverride` replaces default title |
| `buildResultText(winnerName)` | Build ranked result string for win modal |
| `eliminatePlayer()` | Remove current player from `gameState.players` (blackhole); triggers `'vanished'` modal if last player |
| `renderPlayerListPanel()` | Re-render the slide-in player list panel (local/online multi only) |
| `togglePlayerList()` | Open/close the left-side player panel |
| `exitGame()` | Return to playMode screen and reset game state |
| `createOnlineRoom()` / `joinOnlineRoom()` | Online multiplayer functions |

### Item usage timing

**Pre-roll** (usable before dice — `PRE_ROLL_ITEMS`):
`['boots', 'binoculars', 'timestop', 'snatcher', 'babel', 'hammer', 'gekokujo', 'kagemaiha', 'morohajoken']`

**Post-roll** (triggered after landing): `koshindo`, `sakasama`

**Reactive** (triggered when specific condition is met mid-effect):
- `shield` — prompted when player lands on a backward tile (`tile.effect.type === 'move'` with `value < 0`)

**Passive** (no active use): `katashiro` — intercepts incoming attack items; `curseddoll`

> **Note:** `PRE_ROLL_ITEMS` is defined as a local `const` in **two separate places** inside `rollDice()` — once for the `hasPreRollItems` check and once inside `promptItemUsage()`. Update **both** when modifying this list. Items with a precondition (e.g., `hammer` requires a co-located opponent, `snatcher` requires a target with items, `gekokujo` requires a non-self top player, `morohajoken` requires at least 1 player in game) need the precondition check added in both locations.

### babel display rule

`babel` is stored as `'babel'` in `player.items` but displayed as `⭐ スター` everywhere via `itemLabel()` and explicit `displayId = itemId === 'babel' ? 'star' : itemId` guards.

### handleEvent dispatch pattern

`handleEvent(eventEffect)` processes events in this order:
1. Early-return for events with custom UI: `merchant`, `angry`, `self_appeal`, `freemove`, `luckynumber`, `ganbare`, `newstart`, `forceend`
2. Remaining effects (`item`, `extraTurn`, `skip`, numeric, `storm`, `blackhole`, `whitehole`, `mask`, `average`, `nameback`, `resetall`) set a `callback` then fall through to a single `showModal('info', eventText, callback, eventEffect.eventTitle)` at the end.

When adding a new event with simple text + effect, use the callback pattern. For custom UI (multi-step dialog, timers, etc.), add an early-return block before the shared `showModal` call.

---

## Persistence (localStorage)

| Key | Value |
|---|---|
| `stageData_1` / `stageData_2` / `stageData_3` | JSON — 3 save slots, each stores `{ gridSize, board }` |
| `enabledItems` | JSON — `{ [itemId]: boolean }` |
| `firebaseConfig` | JSON — `{ apiKey, databaseURL }` |

---

## Styling Conventions

**Color palette:**
- Primary: `#667eea` / `#764ba2` (purple gradient)
- Forward tile: `#4ade80` (green)
- Backward tile: `#f87171` (red)
- Item tile: `#fbbf24` (yellow)
- Event tile: `#60a5fa` (blue)

**Naming:**
- CSS classes: kebab-case (`.tile-normal`, `.btn-primary`)
- Element IDs: camelCase (`firebaseConfigForm`, `editorMode`)
- Utility classes: `.hidden`, `.text-center`, `.mt-20`

Sections are shown/hidden with `.hidden`. Board grid regenerated via `innerHTML`. Buttons use `data-action` / `data-arg` / `data-*` attributes; clicks dispatched by central `ACTION_HANDLERS` in `js/game.js`.

---

## Code Style Guidelines

- **UI strings**: Japanese only — do not change to English
- **Section headers**: `// ========== Section Name ==========`
- **External CDN libraries**: Firebase SDK v8 Compat CDN + Font Awesome 6.7.2 CDN — no other external dependencies
- **State mutations**: mutate `gameState` directly, then call `render*()` functions
- **DOM updates**: regenerate `innerHTML`; avoid partial mutations
- **XSS safety**: always wrap user-supplied strings in `escapeHtml()` before injecting into `innerHTML`
- **User-facing errors**: `showModal('info', message)`
- **Developer feedback**: `console.log` / `console.error`

### `data-action` / `closeModal*` bridge pattern

`ACTION_HANDLERS` (global scope, ~L3739) dispatches all `data-action` button clicks. Functions called from `data-action` must be in global scope. Multi-step dialogs that need a callback after modal close use one of the pre-defined bridge functions (defined just before `ACTION_HANDLERS`):

```javascript
closeModalThenRollDice()      // closeModal() + doRollDice()
closeModalThenNextTurn()      // closeModal() + nextTurn()
closeModalThenSwitchEditor()  // closeModal() + switchMode('editor')
closeModalThenSwitchPlayMode()// closeModal() + switchMode('playMode')
closeModalThenRestartOnline() // closeModal() + restartOnlineGame()
closeModalThenNailCallback()  // closeModal() + window.nailCallback()
```

Add new bridge functions here when a `data-action` button needs to call a function that isn't already in `ACTION_HANDLERS`.

### `window.*` global state for multi-step UI flows

Multi-step dialogs (merchant, nail, self_appeal, etc.) pass state between `data-action` invocations via `window.*`:

| Variable | Used by |
|---|---|
| `window.modalCallback` | `handleModalOk()` — shared callback for OK-button modals |
| `window.nailCallback` | nail placement confirmation |
| `window.merchantItems3`, `window.merchantRemaining`, `window.merchantPicked` | merchant dialog state |
| `window.selfAppealCurrentPlayer`, `window.selfAppealVoters`, `window.selfAppealTimerId`, `window.selfAppealVoterArrayIndex`, `window.selfAppealCurrentVotes` | self_appeal event flow |
| `window.katashiroContext` | katashiro intercept flow — `{ kind, holderIndex, attackerIndex }` |

---

## Firebase / Online Multiplayer

Firebase SDK v11 Compat is loaded via CDN in `index.html` (3 `<script>` tags before `js/game.js`). "Compat" means v8-style API surface on top of v9+ internals. Room creation, game sync, waiting room player list, and host-triggered game start are all implemented. Key refs: `roomRef`, `playerRef` inside `gameState.firebaseRefs`.

Remaining TODO (marked `// TODO` in code):
- Firebase Compat → v9 Modular migration (deferred)

---

## Git

- Feature/AI branches: `claude/<description>-<id>`
- `text/` directory is gitignored — development notes only
- `.playwright-mcp/` is gitignored — Playwright MCP session logs

---

## Long-term TODOs

- [ ] **Firebase Compat → v9 Modular** — CDN v11 Compat is functional but not tree-shakeable; migration deferred
