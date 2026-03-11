# Puzzle Rivals Arena

Competitive 4-player puzzle lobbies built with Vite, React, TypeScript, shadcn-ui, and Tailwind CSS.

## Current status

- Frontend gameplay flow is implemented
- Fastify backend scaffold now exists in `server/`
- Puzzle selection is now lobby-driven instead of player-selected
- Practice and live rounds use different generated versions of the same puzzle type
- Authoritative lobby state, server-side puzzle seed selection, WebSocket subscriptions, and PayPal order/capture routes are scaffolded
- Persistence, auth, production deployment, and frontend-to-backend wiring are not implemented yet

## Local development

```sh
npm install
npm run dev
npm run dev:server
```

Create env files before running auth, matchmaking, and PayPal-backed flows:

```sh
copy .env.example .env
copy server\\.env.example server\\.env
```

## Verification

```sh
npm run build
npm run build:server
npm run test
```

## Backend surface

- `POST /api/auth/guest`
- `GET /api/auth/me`
- `POST /api/matchmaking/join`
- `GET /api/lobbies/:lobbyId`
- `POST /api/lobbies/:lobbyId/ready`
- `POST /api/lobbies/:lobbyId/progress`
- `POST /api/lobbies/:lobbyId/solve`
- `POST /api/paypal/orders`
- `POST /api/paypal/orders/:orderId/capture`

## Backend note

This repo now includes a SQLite-backed local backend for multiplayer and payments, plus React wiring for auth and matchmaking. The remaining production work is mainly provider-specific deployment, real secret injection, and any larger-scale database or websocket infrastructure you want beyond the single-instance SQLite/Fastify baseline.

See [docs/backend-launch-plan.md](./docs/backend-launch-plan.md) for:

- cheapest public-launch stack options
- backend responsibilities
- PayPal/domain/database/WebSocket checklist
- suggested first API endpoints
