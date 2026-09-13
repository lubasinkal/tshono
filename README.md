# Tshono

Every opportunity in Botswana in one fast search.

Public look first build. Search plus job pages plus insights run on local sample
data. Private engine (n8n scrapers, Postgres, Typesense on VPS) plugs in later
through one file: `app/composables/useJobSearch.ts`.

## Stack

Nuxt 4 + Bun. No UI framework on purpose for speed and cheap data.

## Run it

```bash
bun install
bun run dev
```

Open http://localhost:3000

## Build for Cloudflare Pages

```bash
bun run build
```

Output uses the `cloudflare_pages` Nitro preset. Point Pages at this repo,
build command `bun run build`, output dir `.output/public`.

Set these Pages env vars later when Typesense goes live on the VPS:

- `NUXT_PUBLIC_SEARCH_HOST`
- `NUXT_PUBLIC_SEARCH_PORT`
- `NUXT_PUBLIC_SEARCH_PROTOCOL`
- `NUXT_PUBLIC_SEARCH_KEY` (search only key, never admin)
- `NUXT_PUBLIC_TYPESENSE_COLLECTION`

## Repo split

Public here: UI, docs, sample data, insights queries.
Private elsewhere: scraper selectors, n8n flows with keys, subscriber data,
Typesense admin key, Postgres creds.

## Roadmap

1. Look (now): instant local search, shareable URLs, insights mock
2. Engine: n8n lake to Postgres, index to Typesense on VPS
3. Swap: `useJobSearch.ts` calls Typesense, UI untouched
4. Money: employer posts, featured roles, labour reports
