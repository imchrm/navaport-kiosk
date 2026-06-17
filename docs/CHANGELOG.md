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

### Added (2026-06-17) — Фаза 2: меню

**Решения зафиксированы:**
- D2 закрыт: узбекский язык — латиница.
- D3 закрыт: видео-фон всегда проигрывается; attract — без затемнения; menu root —
  overlay 0.42; при нажатии кнопки видео паузируется + overlay 0.72 (menu sub) / 0.80
  (map/tour); idle 5 с → сброс в attract. Меню появляется автоматически через 3 с.

**content:**
- `ContentBundle` вынесен из `load.ts` в `types.ts` — разрывает транзитивную зависимость
  renderer на `node:fs`; `index.ts` экспортирует тип из `types.ts`.

**renderer:**
- `App.tsx` переработан: видео-фон всегда рендерится на уровне App с `videoRef`;
  `overlayOpacity()` и `videoPaused()` управляют overlay и play/pause через `useEffect`;
  `parseContent(raw)` валидирует IPC-данные Zod-схемами; загрузка config + content —
  `Promise.all` при монтировании; авто-WAKE через 3 с в состоянии attract.
- `AttractScreen.tsx` упрощён: только hint-текст поверх видео (видео перенесено в App).
- `screens/MenuScreen.tsx` — drill-down меню: `getNodesAtPath`, `getBreadcrumbs`,
  сетка тайлов (`minHeight: 160px`), `Tile` c pressed-состоянием; branch → DRILL,
  leaf → OPEN_TARGET; `key={path.join('/')}` для ре-анимации при переходах.
- `components/NavBar.tsx` — шапка 80 px: переключатель языка (uz/ru/en),
  хлебные крошки, кнопки «Домой» / «Назад».
- `hooks/useI18n.ts` — хелпер `t(i18n, lang, key)` с fallback к ключу.
- `styles.css` — `@keyframes slide-up` + `@keyframes fade-in`; классы `.menu-enter`,
  `.fade-in`.
- `typecheck` зелёный по всем четырём пакетам; content smoke-тесты 8/8 зелёных.

### Added (2026-06-17) — Фаза 1: shell + attract

**contract:**
- `KioskConfig.attractVideoSrc` — путь к видео attract-loop (codec TBD, зависит от D1).
- `content/src/index.ts` разделён: browser-safe экспорты (типы, assertNever, схемы) вынесены в `index.ts`;
  `loadContent` остаётся в `load.ts` (Node.js only, импортируется напрямую в main-процессе).

**main (Electron, CJS):**
- `packages/main/src/window.ts` — `createWindow()`: `BrowserWindow` kiosk/fullscreen в prod,
  windowed+DevTools в dev; preload, `contextIsolation: true`, блок `context-menu`.
- `packages/main/src/preload.ts` — `contextBridge.exposeInMainWorld('kiosk', api)`;
  имплементирует `KioskApi` поверх `ipcRenderer` (send/on/invoke).
- `packages/main/src/ipc-main.ts` — `setupIpc()`: `ipcMain.handle('kiosk:getConfig')`;
  дефолтный `KioskConfig` (idleTimeout 60s, lang 'ru', видео-путь — заглушка до D1).
- `packages/main/src/lifecycle.ts` — `startLifecycle()`: idle-таймер с автосбросом по
  `reportActivity`, `kiosk:idleReset` → renderer, `powerSaveBlocker`, очистка на `closed`.
- `packages/main/src/index.ts` — entry: single-instance lock, `setupIpc`, `createWindow`,
  `startLifecycle`; авто-рестарт через `app.relaunch()` при падении renderer.
- Корневые скрипты: `build:main`, `build:renderer`, `dev:renderer`, `dev:main` (cross-env).

**renderer (Vite + React + TypeScript strict):**
- `packages/renderer/vite.config.ts` — Vite 5 + `@vitejs/plugin-react`, port 5173.
- `packages/renderer/index.html` — CSP, `cursor: none`, `user-select: none`, `overflow: hidden`.
- `packages/renderer/src/global.d.ts` — `declare global { interface Window { kiosk: KioskApi } }`.
- `packages/renderer/src/state/screen.ts` — `KioskScreen` (attract/menu/map/tour),
  `Action` (WAKE/DRILL/BACK/HOME/OPEN_TARGET/IDLE_RESET/SET_LANG), `AppState`, reducer (exhaustive).
- `packages/renderer/src/App.tsx` — `useReducer`, `getConfig` при старте, `onIdleReset` hook,
  `reportActivity` на `pointerdown`; switch по `screen.kind` с `assertNever` в default.
- `packages/renderer/src/screens/AttractScreen.tsx` — `<video loop muted playsInline>`,
  hint-текст (uz/ru/en), `onPointerDown` → WAKE.
- `packages/renderer/src/main.tsx` — `createRoot` + `<App />`.
- `typecheck` зелёный по всем четырём пакетам; content smoke-тесты 8/8 зелёных.
