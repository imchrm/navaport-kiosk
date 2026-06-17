# Changelog — navaport-kiosk

Все заметные изменения проекта фиксируются здесь.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
проект придерживается [семантического версионирования](https://semver.org/lang/ru/).

> Статус: **append-only**. Записи не редактируются задним числом и не удаляются.
> Завершённые пункты из `TODO.md` переносятся сюда.
> Секции записи: Added / Changed / Deprecated / Removed / Fixed / Security
> (включаются только непустые).

---

## [Unreleased]

### Added
- Заведена проектная документация: `CONTEXT.md`, `ARCHITECTURE.md`, `TODO.md`, `CHANGELOG.md`.
- Зафиксирована архитектура: оболочка Electron, renderer React + Vite + TypeScript strict, монорепо на npm workspaces (`contract` / `content` / `main` / `renderer`).
- Определена модель контента в типах: `Localized`, дискриминированный `NavTarget`, `MenuNode` (branch xor leaf), `FloorMap` / `MapZone` / `ZoneShape`.
- Принята модель навигации по двум осям («по цели» — меню, «по месту» — 2D-карта), 2D-карта включена в MVP.
- Составлен порядок реализации по фазам 0-5; Фаза 0 разложена на задачи.

### Changed (2026-06-17) — Фаза 0 выполнена
- Имя проекта приведено к `navaport-kiosk` во всех документах (было: `airport-kiosk` / «Airport Wayfinding Kiosk»).

### Added (2026-06-17) — Фаза 0: каркас
- `package.json` корневой с `workspaces: ["packages/*"]`; агрегирующий скрипт `npm run typecheck`.
- `tsconfig.base.json` — `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- `.editorconfig` (UTF-8, LF, indent 2).
- `.prettierrc.json` (singleQuote, trailingComma all, LF).
- `eslint.config.mjs` (flat config, `@typescript-eslint/recommended`, `no-explicit-any: error`).
- Скелеты пакетов `@navaport/contract`, `@navaport/content`, `@navaport/main`, `@navaport/renderer`
  (каждый: `package.json`, `tsconfig.json`, `src/index.ts`).
- `packages/contract/src/ipc.ts` — типы `KioskConfig` и `KioskApi` для IPC main ↔ renderer.
- `packages/content/src/types.ts` — `LangCode`, `Localized`, `NavTarget`, `MenuBranch`, `MenuLeaf`, `MenuNode`, `ZoneShape`, `MapZone`, `FloorMap`.
- `packages/content/src/assertNever.ts` — exhaustiveness helper.
- `packages/content/src/schema.ts` — Zod-схемы `navSchema`, `mapsSchema`, `i18nSchema`;
  рекурсивная схема меню через `z.lazy` типизирована как `ZodType<MenuNode, ZodTypeDef, unknown>`
  (обход ограничения Zod v3 при `exactOptionalPropertyTypes`).
- `packages/content/src/load.ts` — `loadContent(dir)`: читает `nav.json`, `maps.json`, `i18n.json`,
  валидирует Zod, падает с читаемым сообщением при ошибке схемы.
- `content/nav.json` — тестовое дерево меню: одна `branch` («Выходы на посадку») + один прямой `leaf` («Стойки регистрации»), оба с `target.kind='tour'`.
- `content/maps.json` — один этаж (`floor-1`), одна зона `rect` → тур.
- `content/i18n.json` — строки chrome (`nav.back`, `nav.home`, `nav.map`, `lang.*`, `attract.hint`) на `uz` (латиница, D2 TBD), `ru`, `en`.
- Smoke-тест `packages/content/src/__tests__/load.test.ts` (vitest): 8 кейсов — валидный контент, ветка/лист, зона-тур, невалидный kind, пропущенные поля. Все зелёные.
- `typecheck` зелёный по всем четырём пакетам.
