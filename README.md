# XO

A clean, ad-free tic-tac-toe game built with React and TypeScript. No ads, no accounts, no tracking.

<!-- After you deploy, add a screenshot and the live link here:
     ![XO screenshot](docs/screenshot.png)
     **Live demo:** https://your-deployment-url -->

## Features

- **vs Computer** with three difficulty levels: Easy, Medium and Unbeatable
- **2 Players** on one device
- Play as **X or O** (the first player alternates every round)
- Scoreboard that persists on your device between visits
- Light and dark mode that follow your system setting
- Animated marks and win line, with reduced-motion support
- Optional sound effects and haptics (native impact feedback in the mobile apps)
- Keyboard and screen-reader friendly

## Getting started

You need [Node.js](https://nodejs.org) 20.19+ (or 22.12+).

```bash
npm install
npm run dev      # start the dev server (usually http://localhost:5173)
npm test         # run the unit tests
npm run build    # type-check and build for production into dist/
npm run preview  # serve the production build locally
```

## Native mobile apps

The project includes Capacitor iOS and Android apps. Native builds require Xcode on macOS for iOS, or Android Studio with the Android SDK for Android.

```bash
npm run cap:sync          # build the web app and sync both native projects
npm run cap:open:ios      # open the iOS project in Xcode
npm run cap:open:android  # open the Android project in Android Studio
```

Build and run on a simulator or device from Xcode or Android Studio. The haptics setting uses native impact feedback in the installed apps; browser vibration remains dependent on browser and device support.

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 19 + TypeScript |
| Build tool | Vite |
| Native apps | Capacitor (iOS and Android) |
| Haptics | Capacitor Haptics |
| Animation | Framer Motion |
| Styling | Plain CSS with design tokens (`src/index.css`) |
| Tests | Vitest |

## Project structure

```
src/
  game/                 Pure game logic, no React. Easy to test and reuse.
    board.ts            Board type, win detection, placing marks
    ai.ts               Computer opponent (easy / medium / minimax)
    reducer.ts          Game state machine: moves, rounds, scores, settings
    status.ts           The one-line message under the board
    storage.ts          Validated save/load of settings and scores
    haptics.ts          Native impact feedback with browser vibration fallback
    useGame.ts          React hook that connects the above to the UI
    *.test.ts           Unit tests
  components/           Board, Mark, WinLine, Scoreboard, Segmented control
  App.tsx               Page layout
  index.css             Design tokens and all styling
```

The game rules live in `src/game` and know nothing about React. That keeps them easy to test, and it means the same logic can run on a server for online play later.

## How the computer plays

- **Easy:** picks any open square.
- **Medium:** wins if it can, blocks if it must, otherwise takes the centre or a random square. A fork beats it.
- **Unbeatable:** minimax search over the full game tree, preferring quicker wins and slower losses. Equal best moves are chosen at random so games vary. The tests play out every possible opponent move against it, as both X and O, and check that it never loses.

## Design notes

- Native system font stack, so it renders as SF Pro on Apple devices.
- A small set of colour, radius and shadow tokens at the top of `index.css`, with a dark theme that overrides them.
- Spring-based motion for taps and the sliding segmented-control highlight; marks draw themselves with SVG strokes so they stay crisp at any size.
- The squares have no gaps between them (spacing is padding inside each square), so the win line can be drawn on an exact 3 x 3 grid.
- Squares use `aria-disabled` rather than `disabled`, so keyboard focus isn't lost while the computer is thinking.

## Roadmap

1. Private rooms with a shareable link (Node + WebSockets)
2. Quick match with random opponents, nicknames and a leaderboard
3. Installable PWA
