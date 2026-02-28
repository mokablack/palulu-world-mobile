# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**ぱるるワールドMobile** is a Japanese mobile-first browser-based board game (双六). Modes:

- **Board Editor** — design custom boards with a tile palette
- **Single-player** — solo play
- **Local Multiplayer** — 2–12 players on the same device
- **Online Multiplayer** — Firebase-backed room system (partially implemented)

No build tooling. Open `index.html` directly in any browser.

---

## Architecture

**No build tooling** — open `index.html` directly in any browser. No npm, no build step.

### File Structure

```
index.html        (~216 lines) — HTML skeleton only
css/
  styles.css      (~762 lines) — all styles
js/
  game.js         (~3046 lines) — all game logic
```

`index.html` loads Font Awesome 6 CDN, `css/styles.css`, Firebase SDK v8 CDN (3 scripts), then `js/game.js`.

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
16. 逆さまスプレー / コシンドスプレー / バベル / 呪われた人形 / スナッチャー / トンカチ / 釘＋トンカチコンボ / 釘の設置 (per-item handlers, L1582–L1879)
17. 怪しい商人UI — `showMerchantDialog()` and related (L2171)
18. モーダル — `showModal()`, `buildResultText()`, `nextTurn()` (L2449)
19. 自分をアピールして！ / 好きなだけ進んでいいよ / 今日のラッキーナンバーは？ / 怒らせたら10進む (custom event UIs, L2561–L2960)
20. イベント委譲ディスパッチャー — `closeModal*` bridge functions, `ACTION_HANDLERS`, `document.addEventListener('click', ...)`, `init()` call (L2963)

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
    shieldActive: false,
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

// Items (13 total) — each has id, name, icon (emoji), effect (string)
const ITEMS = [
    { id: 'boots',      name: '魔法の靴',         icon: '👟', ... },
    { id: 'shield',     name: '盾',               icon: '🛡️', ... },
    { id: 'binoculars', name: '双眼鏡',           icon: '🔭', ... },
    { id: 'timestop',   name: 'タイムストップ',   icon: '⏸️', ... },
    { id: 'koshindo',   name: 'コシンドスプレー', icon: '💨', ... },
    { id: 'sakasama',   name: '逆さまスプレー',   icon: '🔄', ... },
    { id: 'star',       name: 'スター',           icon: '⭐', ... },
    { id: 'curseddoll', name: '呪われた人形',     icon: '🧸', ... },
    { id: 'babel',      name: 'バベル',           icon: '🌀', ... },  // displayed as star externally
    { id: 'snatcher',   name: 'スナッチャー',     icon: '🎣', ... },  // 他プレイヤーのアイテムを1つ奪う
    { id: 'nail',       name: '釘',               icon: '📌', ... },
    { id: 'hammer',     name: 'トンカチ',         icon: '🔨', ... },
    { id: 'kagemaiha',  name: '影舞葉',           icon: '🍃', ... },
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
| `nextTurn()` | Advance turn; handles skip, nailPlacement prompt |
| `showModal(type, message, callback?, titleOverride?)` | `type`: `'info'` \| `'win'` \| `'vanished'`; `titleOverride` replaces default title |
| `buildResultText(winnerName)` | Build ranked result string for win modal |
| `eliminatePlayer()` | Remove current player from `gameState.players` (blackhole); triggers `'vanished'` modal if last player |
| `renderPlayerListPanel()` | Re-render the slide-in player list panel (local/online multi only) |
| `togglePlayerList()` | Open/close the left-side player panel |
| `exitGame()` | Return to playMode screen and reset game state |
| `createOnlineRoom()` / `joinOnlineRoom()` | Online multiplayer functions |

### Pre-roll items (usable before dice)

`PRE_ROLL_ITEMS = ['boots', 'shield', 'binoculars', 'timestop', 'snatcher', 'babel', 'hammer', 'kagemaiha']`

Post-roll items (`koshindo`, `sakasama`) are triggered after landing.

> **Note:** `PRE_ROLL_ITEMS` is defined as a local `const` in two separate code paths inside `rollDice()` — once for the `hasPreRollItems` check and once inside `promptItemUsage()`. If you add items to this list, update **both** occurrences. Also note: `hammer` has an additional same-tile check in both occurrences — match this pattern for any item with a precondition.

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
- **External CDN libraries**: Firebase SDK v11 Compat CDN + Font Awesome 6.7.2 CDN — no other external dependencies
- **State mutations**: mutate `gameState` directly, then call `render*()` functions
- **DOM updates**: regenerate `innerHTML`; avoid partial mutations
- **XSS safety**: always wrap user-supplied strings in `escapeHtml()` before injecting into `innerHTML`
- **User-facing errors**: `showModal('info', message)`
- **Developer feedback**: `console.log` / `console.error`

### `data-action` / `closeModal*` bridge pattern

`ACTION_HANDLERS` (global scope, L2963) dispatches all `data-action` button clicks. Functions called from `data-action` must be in global scope. Multi-step dialogs that need a callback after modal close use one of the pre-defined bridge functions:

```javascript
// L2964-2969 (global scope, outside main function body)
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

---

## Firebase / Online Multiplayer

Firebase SDK v8 is loaded via CDN in `index.html` (3 `<script>` tags before `js/game.js`). Room creation, game sync, waiting room player list, and host-triggered game start are all implemented. Key refs: `roomRef`, `playerRef` inside `gameState.firebaseRefs`.

Remaining TODO (marked `// TODO` in code):
- Firebase v8 → v9 Modular migration (CDN v8 is legacy; deferred)

---

## Git

- Feature/AI branches: `claude/<description>-<id>`
- `text/` directory is gitignored — development notes only
- `.playwright-mcp/` is gitignored — Playwright MCP session logs

---

## Long-term TODOs

- [ ] **Firebase v8 → v9 Modular** — CDN v8 is legacy; migration deferred
