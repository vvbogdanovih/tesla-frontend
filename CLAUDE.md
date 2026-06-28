# CLAUDE.md

Guidance for Claude Code when working in **tesla-frontend** — публічний сторфронт (каталог запчастин Tesla, картка товару, кошик/чекаут, контент, акаунт). Українською. SEO-критичний.

## Commands

```bash
yarn dev      # next dev -p 3040
yarn build    # next build
yarn start    # next start -p 3000  (прод-порт — НЕ чіпати)
yarn lint / yarn format
```

## Architecture

**Next.js 16** (App Router, SSR/SSG для SEO) · React 19 (**React Compiler**) · TanStack Query · Zustand · react-hook-form + zod · shadcn/ui (new-york) · Tailwind v4 · axios.

```
src/
├── app/                       # маршрути (App Router); layout, globals.css
└── common/
    ├── components/  layout/ · ui/
    ├── services/    *.api.ts (axios)
    ├── store/       Zustand (кошик тощо)
    ├── constants/ · types/ · utils/ (cn)
```

## Key patterns

- **SEO — пріоритет №1.** SSR/SSG, повний набір метатегів, OpenGraph, JSON-LD (Product/BreadcrumbList/Organization), канонічні URL, sitemap, чисті ЧПУ. Деталі — `tesla-meta/docs/seo-strategy.md`.
- **Rich text** — товар/блог приходять з бекенда вже як санітизований **HTML** (`*_html`); рендерити його, JSON не парсити (ADR-0006). Стилізувати через `prose`-обгортку.
- **Сумісність** — фільтр каталогу за авто (модель/генерація) → бекенд за `ProductFitment` (ADR-0002). Модель = фільтр, не власник товару.
- **API** — `NEXT_PUBLIC_API_BASE_URL` (build-time), `NEXT_PUBLIC_SITE_URL`. axios з `withCredentials:true` для сесійних запитів.
- Alias `@/*` → `src/*`.

## Design system

Канон — `tesla-meta/docs/design-principles.md` + живі HTML-референси в `tesla-meta/docs/assets/*.html`.
- **Golden Amber** акцент (amber-500 `#F59E0B`, hover 600 `#D97706`, link 700, dark 400), cool-grey нейтралі `n-0..n-950`.
- Світла/темна теми через CSS-токени + перемикач.
- Шрифти: **Unbounded** (display/hero, weight 500) + **Onest** (body/headings).
- Контейнер 1240px (full-bleed фон + обмежений контент). Поважати `prefers-reduced-motion`.

## Conventions

Prettier: **tabs, без `;`, одинарні лапки** + `prettier-plugin-tailwindcss`. shadcn — new-york.
