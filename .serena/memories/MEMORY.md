# ぱるるワールドMobile - Project Memory

## Project
Japanese mobile-first browser-based board game (双六). No build tooling — open `index.html` directly.

## Key Files
- `C:/Users/mirai/Documents/my_app/palulu-world-mobile/index.html` — HTML skeleton
- `C:/Users/mirai/Documents/my_app/palulu-world-mobile/css/styles.css` — all styles
- `C:/Users/mirai/Documents/my_app/palulu-world-mobile/js/game.js` — all game logic (~3434 lines)

## Playwright Debugging
- Output dir: `.playwright-mcp/<YYYY-MM-DD>/<session>/`
- Open via `file://` URL (no server needed)
- Firebase errors can be ignored
- See `debugging.md` for patterns

## Tech Stack
- Vanilla JS, no build tools
- Firebase SDK v8 CDN
- Font Awesome 6.7.2 CDN
- No npm, no bundler

## Testing
No automated test runner. Playwright MCP used for manual verification.
