# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**ぱるるワールドMobile** is a Japanese mobile-first browser-based board game (双六). Modes:

- **Board Editor** — design custom boards with a tile palette
- **Single-player** — solo play
- **Local Multiplayer** — 2–4 players on the same device
- **Online Multiplayer** — Firebase-backed room system (stubbed with TODOs)

No build tooling. Open `index.html` directly in any browser.

---

## Architecture

**Single-file application** — all HTML, CSS, and JavaScript live in `index.html`. No npm, no build step, no external dependencies (Firebase SDK is the only planned exception, not yet loaded).

### `index.html` Layout

| Lines (approx.) | Content |
|---|---|
| 1–703 | HTML structure + inline `<style>` block |
| 704–end | `<script>` block with all game logic |

### Script Section Order (delimited by `// ========== ... ==========`)

1. Data definitions (`TILE_TYPES`, `ITEMS`, `EVENTS`)
2. Game state (`gameState`)
3. Initialization (`init()`)
4. Firebase configuration
5. Board management + rendering
6. Palette functions
7. Item management
8. Event management
9. Stage save/load
10. Mode switching
11. Player setup
12. Game start logic
13. Online multiplayer (stubbed)
14. Game play mechanics — dice, movement, tile effects, item usage
15. Modal utilities

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
        eventEffect?: number | 'item' | 'extraTurn' | 'skip' | 'storm' | 'blackhole' | 'whitehole'
    }
}
```

### Player object

```javascript
{
    name: string,
    position: number,       // Index into gameState.board
    items: string[],        // Collected item IDs
    skipTurn: boolean,
    babelTarget: number | null  // Player index for バベル item effect
}
```

### Constants

```javascript
const TILE_TYPES = { NORMAL, FORWARD, BACKWARD, ITEM, EVENT, START, GOAL };

// Items (10 total)
const ITEMS = [
    { id: 'boots',      name: '魔法の靴',         effect: '次のターン移動量+2' },
    { id: 'shield',     name: '盾',               effect: '戻るマスの効果を1回無効化' },
    { id: 'binoculars', name: '双眼鏡',           effect: 'サイコロを2回振り好きな目を選べる' },
    { id: 'timestop',   name: 'タイムストップ',   effect: '次の順番のプレイヤーが1ターン休み' },
    { id: 'koshindo',   name: 'コシンドスプレー', effect: '止まったマスの効果を1度だけ無効化（着地後使用）' },
    { id: 'sakasama',   name: '逆さまスプレー',   effect: 'サイコロの目だけ逆方向に移動（サイコロ後使用）' },
    { id: 'star',       name: 'スター',           effect: 'リザルトに記録される（効果なし）' },
    { id: 'curseddoll', name: '呪われた人形',     effect: '他プレイヤーのマス効果を代わりに受けることがある（受動）' },
    { id: 'babel',      name: 'バベル',           effect: 'ゲーム終了後、選択したプレイヤーと順位を入れ替える' },
    { id: 'snatcher',   name: 'スナッチャー',     effect: '自分のアイテムを他プレイヤーのアイテムと交換する' },
];

// Events (8 total)
const EVENTS = [
    { id: 'merchant',  title: '怪しい商人',     text: '...', effect: 'item' },
    { id: 'wind',      title: '突風',           text: '...', effect: -2 },
    { id: 'goddess',   title: '幸運の女神',     text: '...', effect: 'extraTurn' },
    { id: 'pit',       title: '落とし穴',       text: '...', effect: 'skip' },
    { id: 'tailwind',  title: '追い風',         text: '...', effect: 3 },
    { id: 'storm',     title: '嵐',             text: '...', effect: 'storm' },
    { id: 'blackhole', title: 'ブラックホール', text: '...', effect: 'blackhole' },
    { id: 'whitehole', title: 'ホワイトホール', text: '...', effect: 'whitehole' },
];
```

---

## Key Functions

| Function | Purpose |
|---|---|
| `init()` | Entry point on page load |
| `switchMode(mode)` | Navigate between editor / single / local / online |
| `initializeBoard()` | Reset board to default |
| `renderBoard()` | Re-render board grid from `gameState.board` |
| `saveStage()` / `loadStage()` | Persist/restore board to localStorage |
| `startSinglePlay()` / `startLocalMulti()` | Transition to active gameplay |
| `rollDice()` | Animate dice and compute movement |
| `movePlayer(steps)` | Advance current player and apply tile effect |
| `executeTileEffect(tile)` | Evaluate effect of landing on a tile |
| `showModal(type, message, callback?)` | Display info or confirm modal |
| `createOnlineRoom()` / `joinOnlineRoom()` | Online stub functions |

---

## Persistence (localStorage)

| Key | Value |
|---|---|
| `stageData` | JSON — saved board layout + grid size |
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

Sections are shown/hidden with `.hidden`. Board grid regenerated via `innerHTML`. Inline `onclick` handlers used throughout.

---

## Code Style Guidelines

- **UI strings**: Japanese only — do not change to English
- **Section headers**: `// ========== Section Name ==========`
- **No external libraries**: dependency-free (Firebase SDK exception for online multiplayer)
- **State mutations**: mutate `gameState` directly, then call `render*()` functions
- **DOM updates**: regenerate `innerHTML`; avoid partial mutations
- **User-facing errors**: `showModal('info', message)`
- **Developer feedback**: `console.log` / `console.error`

---

## Firebase / Online Multiplayer (Incomplete)

Stubbed — SDK not loaded. `initializeFirebase()` only logs to console.

TODOs (marked `// TODO` in code):
- Load Firebase SDK via CDN `<script>` tag
- Call `firebase.initializeApp()` inside `initializeFirebase()`
- Implement Realtime Database reads/writes in `createOnlineRoom()`, `joinOnlineRoom()`, `updateWaitingPlayers()`, `startOnlineGame()`

Do **not** remove the stub functions — they define the expected API surface.

---

## Git

- Feature/AI branches: `claude/<description>-<id>`
- `text/` directory is gitignored — development notes only
