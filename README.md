# NetworkAI Frontend

A small creator community built with **Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS**.
It talks to a Go + Elasticsearch + Google Cloud Storage backend: [luyuyang34-afk/networkai](https://github.com/luyuyang34-afk/networkai).

## Features

- **Accounts** – sign up and sign in; the Go API issues a JWT that the browser sends as a Bearer token.
- **Discover** – search posts by caption keywords or exact creator, with image and video cards.
- **Publish** – upload a JPG, PNG, GIF, MP4 or MOV (up to 10 MB) with a caption.
- **Ownership** – authors see a Delete control on their own posts; the backend enforces ownership.
- **AI Studio** – describe an image (optionally with a reference image), preview the result, then publish it.
- **Networking assistant** – an OpenAI tool-calling agent that searches posts for you and suggests who to connect with.

## Architecture

```
Browser (client components)
 ├─ src/lib/api.ts ──────────────▶ Go API (auth, posts, search, delete)
 └─ /api/image, /api/agent ──────▶ Next.js route handlers (server only)
                                      ├─ verify the JWT with the Go API first
                                      └─ call OpenAI with a server-side key
```

- The OpenAI key never reaches the browser: only `NEXT_PUBLIC_*` variables are bundled into client code.
- The image route checks origin, token shape, body size and image magic bytes before any paid call.
- The feed cancels stale searches with `AbortController` and refetches after publishing via a revision counter.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

| Variable | Where it is used |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the Go API (public) |
| `OPENAI_API_KEY` | Server-only key for AI Studio and the assistant |
| `OPENAI_AGENT_MODEL` | Model used by the networking assistant |
| `NETWORKAI_APP_ORIGIN` | Optional; the public origin when running behind a proxy |

Checks: `npm run lint`, `npx tsc --noEmit`, `npm run build`.
