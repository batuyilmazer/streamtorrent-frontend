# StreamTorrent Frontend

Astro + React frontend for StreamTorrent.

## Responsibilities

- public browsing and watch flow
- auth screens and session-aware navigation
- saved torrents, collections, and profile screens
- backend API consumption through shared transport utilities

## Structure

```text
src/
├── components/
│   ├── auth/
│   ├── collections/
│   ├── layout/
│   ├── library/
│   ├── providers/
│   ├── torrents/
│   └── ui/
├── layouts/
├── lib/
├── pages/
└── styles/
```

## Commands

```sh
npm run dev
npm run build
npm run typecheck
```

## Conventions

- `src/pages` stays thin; route-local composition only.
- API base resolution lives in `src/lib/apiBase.ts`.
- Auth/session transport lives in `src/lib/auth`.
- Shared API types stay in `src/lib/api.ts` until feature slices are split further.
