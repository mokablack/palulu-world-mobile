# CLAUDE.md — Palulu World Mobile

This file documents the codebase structure, conventions, and workflows for AI assistants working on this project.

---

## Project Overview

**ぱるるワールドMobile** (Palulu World Mobile) is a Japanese browser-based board game with the following modes:

- **Board Editor** — design custom game boards using a tile palette
- **Single-player** — play against an AI or solo
- **Local Multiplayer** — 2–4 players on the same device
- **Online Multiplayer** — Firebase-backed room system (structure exists; implementation is stubbed with TODOs)

The game is mobile-first (touch optimized), entirely in Japanese, and requires no build tooling.

---

## Architecture

### Single-File Application

The entire application lives in one file:

```
/
├── index.html     ← HTML + CSS + JavaScript, all inline
├── .gitignore
└── CLAUDE.md
```

There is:
- No `package.json`, no npm, no Node.js
- No build system (no webpack, Vite, Parcel, etc.)
- No TypeScript, no transpilation
- No test framework
- No external dependencies (zero CDN imports)

To run the app: open `index.html` in any modern browser.

---

## File Structure: `index.html`

The file is divided into three logical sections:

| Lines (approx.) | Content |
|---|---|
| 1–533 | HTML structure with embedded `<style>` block |
| 534–703 | Remaining HTML (game sections, modal) |
| 704–end | `<script>` block with all game logic |

### JavaScript Section Layout

The script block is organized with `// ========== ... ==========` section headers:

1. **Data definitions** — `TILE_TYPES`, `ITEMS`, `EVENTS` constants
2. **Game state** — single `gameState` object
3. **Initialization** — `init()` entry point
4. **Firebase configuration** — load/save/clear from localStorage
5. **Board management** — grid size, tile placement, board rendering
6. **Palette functions** — tile type selector in the editor
7. **Item management** — enable/disable collectible items
8. **Event management** — configure event tiles
9. **Stage save/load** — persist board layout to localStorage
10. **Mode switching** — navigate between editor and play modes
11. **Player setup** — name input, player count selection
12. **Game start logic** — transition from setup to active gameplay
13. **Online multiplayer** — room creation and joining (stubbed)
14. **Game play mechanics** — dice, movement, tile effects
15. **Modal utilities** — generic info/confirm dialog

---

## Data Model

### `gameState` (central state object)

```javascript
let gameState = {
    // Editor
    mode: 'editor',                     // Current screen: 'editor' | 'single' | 'local' | 'online'
    gridSize: { rows: 5, cols: 5 },
    board: [],                          // Array of tile objects (see Tile below)
    selectedTileType: TILE_TYPES.NORMAL,
    enabledItems: {},                   // { [itemId]: boolean }
    selectedEventForTile: null,
    editingTileIndex: null,

    // Gameplay
    playMode: null,                     // 'single' | 'local' | 'online'
    players: [],                        // Array of player objects (see Player below)
    currentPlayerIndex: 0,
    diceValue: 1,
    isRolling: false,

    // Firebase
    firebaseConfig: null,              // { apiKey, databaseURL }
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
    name: string,           // Japanese display name
    color: string,          // CSS class (e.g. 'tile-normal', 'tile-forward')
    effect: null | {
        type: 'move' | 'item' | 'event',
        value?: number,         // Spaces to move (positive = forward, negative = backward)
        eventId?: string,
        eventTitle?: string,
        eventText?: string,
        eventEffect?: number | string   // number = move, 'item' | 'extraTurn' | 'skip' | 'storm'
    }
}
```

### Player object

```javascript
{
    name: string,
    position: number,       // Index into gameState.board
    items: string[],        // Collected item IDs
    skipTurn: boolean
}
```

### Constants

```javascript
// Tile types
const TILE_TYPES = {
    NORMAL, FORWARD, BACKWARD, ITEM, EVENT, START, GOAL
};

// Items (4 total)
const ITEMS = [
    { id: 'boots',      name: '魔法の靴',      effect: '次のターン移動量+2' },
    { id: 'shield',     name: '盾',            effect: '戻るマスの効果を1回無効化' },
    { id: 'binoculars', name: '双眼鏡',        effect: 'サイコロを2回振り好きな目を選べる' },
    { id: 'timestop',  name: 'タイムストップ', effect: '次の順番のプレイヤーが1ターン休み' }
];

// Events (6 total)
const EVENTS = [
    { id: 'merchant', effect: 'item' },
    { id: 'wind',     effect: -2 },
    { id: 'goddess',  effect: 'extraTurn' },
    { id: 'pit',      effect: 'skip' },
    { id: 'tailwind', effect: 3 },
    { id: 'storm',    effect: 'storm' }
];
```

---

## Persistence

All persistence is via `localStorage` (no server calls in the working implementation):

| Key | Value | Description |
|---|---|---|
| `firebaseConfig` | JSON string `{ apiKey, databaseURL }` | Firebase credentials |
| `stageData` | JSON string | Saved board layout and grid size |
| `enabledItems` | JSON string `{ [itemId]: boolean }` | Item enable states |

---

## Styling Conventions

All CSS is inline in the `<style>` block.

**Color palette:**
- Primary: `#667eea` (purple) / `#764ba2` (darker purple)
- Tile forward (advance): green `#4ade80`
- Tile backward (retreat): red `#f87171`
- Tile item: yellow `#fbbf24`
- Tile event: blue `#60a5fa`
- Background gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

**Naming conventions:**
- CSS classes: kebab-case (`.tile-normal`, `.btn-primary`, `.mode-btn`)
- Utility classes: `.hidden`, `.text-center`, `.mt-20`
- Button variants: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`

**Fonts:** `'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif`

**Mobile optimizations:**
- `touch-action: manipulation` on `body`
- `user-scalable=no` in viewport meta
- Max container width: `800px`
- CSS Grid for the game board: `grid-template-columns: repeat(N, 1fr)`

---

## Key Functions Reference

| Function | Purpose |
|---|---|
| `init()` | Application entry point; called on page load |
| `switchMode(mode)` | Navigate between editor / single / local / online screens |
| `initializeBoard()` | Reset board to default (start → normal tiles → goal) |
| `renderBoard()` | Re-render the board grid from `gameState.board` |
| `renderPalette()` | Render the tile type selector |
| `saveStage()` | Persist current board to `localStorage` |
| `loadStage()` | Restore board from `localStorage` |
| `startSinglePlay()` | Transition from setup into single-player game |
| `startLocalMulti()` | Transition from setup into local multiplayer game |
| `rollDice()` | Animate dice and compute movement |
| `movePlayer(steps)` | Advance current player and apply tile effect |
| `executeTileEffect(tile)` | Evaluate the effect of landing on a tile |
| `showModal(type, message)` | Display info or confirm modal |
| `createOnlineRoom()` | Generate a room ID (online stub) |
| `joinOnlineRoom()` | Join by room ID (online stub) |

---

## DOM Conventions

- Element IDs: camelCase (`firebaseConfigForm`, `editorMode`, `onlineMultiBtn`)
- Sections are shown/hidden with the `.hidden` CSS class
- Direct DOM access via `document.getElementById()` and `document.querySelector()`
- Inline `onclick` handlers on many HTML elements; some listeners added via `addEventListener`
- The board grid is re-generated via `innerHTML` assignment on state changes

---

## Firebase / Online Multiplayer (Incomplete)

The Firebase integration is **stubbed**. The structure and UI exist but the SDK is not loaded and `initializeFirebase()` only logs to the console.

Key TODOs in the code (marked with `// TODO`):
- Load the Firebase SDK (CDN script tag)
- Call `firebase.initializeApp(gameState.firebaseConfig)` inside `initializeFirebase()`
- Implement Realtime Database reads/writes in `createOnlineRoom()`, `joinOnlineRoom()`, `updateWaitingPlayers()`, `startOnlineGame()`

Do **not** remove the stubbed functions — they establish the expected API surface for future implementation.

---

## Development Workflow

### Running the App

```bash
# No build step needed — just open the file
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
# Or use any local HTTP server:
python3 -m http.server 8080
```

### Making Changes

1. Edit `index.html` directly.
2. Refresh the browser to see changes.
3. Use browser DevTools for debugging (`console.log` statements are present throughout).

### Git

- Main development branch: `master` / `main`
- Feature/AI branches follow the pattern: `claude/<description>-<id>`

### Testing

There is no automated test suite. Testing is manual via the browser UI. When adding significant logic, consider using `console.assert()` or browser-based manual validation.

---

## Code Style Guidelines

- **Language of UI strings**: Japanese — do not change user-visible text to English
- **Section headers**: Use `// ========== Section Name ==========` to delineate logical sections
- **No external libraries**: Keep the app dependency-free; do not add CDN imports (except for Firebase when implementing online multiplayer)
- **State mutations**: Always mutate `gameState` directly, then call the relevant `render*()` function
- **DOM updates**: Re-render affected sections by regenerating `innerHTML`; avoid partial in-place mutations unless performance requires it
- **Persistence**: Use `localStorage` for all client-side persistence; keep key names consistent with those listed above
- **Error feedback**: Use `showModal('info', message)` for user-facing errors; use `console.log` or `console.error` for developer feedback

---

## .gitignore

```
#開発要項
text/

# エディタ関連
.vscode/
```

The `text/` directory is excluded — it is used for development notes and design documents.
