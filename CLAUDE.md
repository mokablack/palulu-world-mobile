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
index.html        (~206 lines) — HTML skeleton only
css/
  styles.css      (~644 lines) — all styles
js/
  game.js         (~2512 lines) — all game logic
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
16. 逆さまスプレー / コシンドスプレー / バベル / 呪われた人形 / スナッチャー / トンカチ / 釘 (per-item handlers)
17. 怪しい商人UI — `showMerchantDialog()` and related (~L2784)
18. モーダル — `showModal()`, `buildResultText()`, `nextTurn()`
19. イベント委譲ディスパッチャー — `ACTION_HANDLERS` + `document.addEventListener('click', ...)`
20. 起動 — `init()` call

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
    id: 'normal' | 'forward' | 'backward' | 'item' | 'event' | 'start' | 'goal',
    name: string,
    color: string,          // CSS class e.g. 'tile-normal'
    effect: null | {
        type: 'move' | 'item' | 'event',
        value?: number,
        eventId?: string,
        eventTitle?: string,
        eventText?: string,
        eventEffect?: number | 'merchant' | 'extraTurn' | 'skip' | 'storm'
                    | 'blackhole' | 'whitehole' | 'mask' | 'average'
                    | 'forceend' | 'nameback' | 'ganbare' | 'resetall' | 'newstart'
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
    { id: 'snatcher',   name: 'スナッチャー',     icon: '🎣', ... },
    { id: 'nail',       name: '釘',               icon: '📌', ... },
    { id: 'hammer',     name: 'トンカチ',         icon: '🔨', ... },
    { id: 'kagemaiha',  name: '影舞葉',           icon: '🍃', ... },
];

// Events (15 total)
const EVENTS = [
    { id: 'merchant',  effect: 'merchant'  },  // 3択アイテム選択UI
    { id: 'wind',      effect: -2          },
    { id: 'goddess',   effect: 'extraTurn' },
    { id: 'pit',       effect: 'skip'      },
    { id: 'tailwind',  effect: 3           },
    { id: 'storm',     effect: 'storm'     },
    { id: 'blackhole', effect: 'blackhole' },
    { id: 'whitehole', effect: 'whitehole' },
    { id: 'mask',      effect: 'mask'      },  // 別の覆面マスへワープ
    { id: 'average',   effect: 'average'   },  // 全員同じマスへ
    { id: 'forceend',  effect: 'forceend'  },  // 強制ゲーム終了
    { id: 'nameback',  effect: 'nameback'  },  // 名前文字数分戻る
    { id: 'ganbare',   effect: 'ganbare'   },  // 大テキスト表示のみ
    { id: 'resetall',  effect: 'resetall'  },  // 全員スタートへ
    { id: 'newstart',  effect: 'newstart'  },  // 盤面再構成
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
| `saveStage()` / `loadStage()` | Persist/restore board to localStorage |
| `startSinglePlay()` / `startLocalMulti()` | Transition to active gameplay |
| `rollDice()` | Animate dice and compute movement |
| `movePlayer(steps)` | Advance current player with step-by-step animation |
| `executeTileEffect(tile)` | Evaluate effect on landing; checks immunity + curseddoll first |
| `handleEvent(eventEffect)` | Dispatch event effects including all new event types |
| `showMerchantDialog()` | 3択アイテム選択UI for 怪しい商人 event; each offer has 25% chance of being fake (消滅) |
| `useKagemaiha()` | Move to 1-rank-above player's tile, apply tile effect without dice |
| `nextTurn()` | Advance turn; handles skip, nailPlacement prompt |
| `showModal(type, message, callback?)` | `type`: `'info'` \| `'win'` \| `'vanished'` |
| `buildResultText(winnerName)` | Build ranked result string for win modal |
| `createOnlineRoom()` / `joinOnlineRoom()` | Online multiplayer functions |

### Pre-roll items (usable before dice)

`PRE_ROLL_ITEMS = ['boots', 'shield', 'binoculars', 'timestop', 'snatcher', 'babel', 'hammer', 'kagemaiha']`

Post-roll items (`koshindo`, `sakasama`) are triggered after landing.

> **Note:** `PRE_ROLL_ITEMS` is defined as a local `const` in two separate code paths (around L1803 and L1817). If you add items to this list, update both occurrences.

### babel display rule

`babel` is stored as `'babel'` in `player.items` but displayed as `⭐ スター` everywhere via `itemLabel()` and explicit `displayId = itemId === 'babel' ? 'star' : itemId` guards.

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
- **External CDN libraries**: Firebase SDK v8 CDN + Font Awesome 6.5.2 CDN — no other external dependencies
- **State mutations**: mutate `gameState` directly, then call `render*()` functions
- **DOM updates**: regenerate `innerHTML`; avoid partial mutations
- **XSS safety**: always wrap user-supplied strings in `escapeHtml()` before injecting into `innerHTML`
- **User-facing errors**: `showModal('info', message)`
- **Developer feedback**: `console.log` / `console.error`

---

## Firebase / Online Multiplayer

Firebase SDK v8 is loaded via CDN in `index.html` (3 `<script>` tags before `js/game.js`). Room creation and game sync are implemented. Key refs: `roomRef`, `playerRef` inside `gameState.firebaseRefs`.

Remaining TODOs (marked `// TODO` in code):
- `updateWaitingPlayers()` — real-time player list in waiting room
- `startOnlineGame()` — host-triggered game start

Do **not** remove stub functions — they define the expected API surface.

---

## Git

- Feature/AI branches: `claude/<description>-<id>`
- `text/` directory is gitignored — development notes only
- `.playwright-mcp/` is gitignored — Playwright MCP session logs

---

## Long-term TODOs (from `text/codex review.md`)

- [x] **CSS/JS separation** — `css/styles.css` + `js/game.js` に分離済み
- [x] **`onclick` migration** — 70箇所を `data-action` + `ACTION_HANDLERS` に移行済み
- [ ] **Firebase v8 → v9 Modular** — CDN v8 is legacy; migration deferred
