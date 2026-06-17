# TODO.md — navaport-kiosk

> Статус: **rolling**. Активная фаза — детально; будущие — крупными строками,
> разворачивать в задачи при переходе. Источник фаз — `ARCHITECTURE.md` §12.
>
> Формат: `- [ ]` открыто, `- [x]` сделано. Завершённое переносить в `CHANGELOG.md`
> и убирать отсюда, чтобы файл не разрастался.

---

## Сейчас — Фаза 1: shell + attract

Цель фазы: Electron-оболочка с kiosk-окном, attract-loop видео, idle-сброс, типизированный IPC, watchdog.

### Electron main process
- [x] Kiosk-окно (`BrowserWindow` fullscreen/kiosk в prod, windowed в dev)
- [x] Preload bridge (`contextBridge` + `KioskApi` facade)
- [x] Типизированный IPC: `kiosk:reportActivity`, `kiosk:idleReset`, `kiosk:getConfig`
- [x] `KioskConfig` с `idleTimeoutMs`, `defaultLang`, `attractVideoSrc`
- [x] Idle-таймер в main: сброс по `reportActivity`, отправляет `kiosk:idleReset` в renderer
- [x] `powerSaveBlocker.start('prevent-display-sleep')`
- [x] Single-instance lock (`app.requestSingleInstanceLock`)
- [x] Авто-рестарт renderer при падении (`webContents.on('destroyed')`)
- [ ] Блокировки жестов (pinch-zoom, drag, F-keys) — перенести в Фазу 5
- [ ] Авто-старт при загрузке ОС — перенести в Фазу 5 (зависит от D1)

### Renderer: attract-loop + state machine
- [x] `KioskScreen` — дискриминированный union (attract / menu / map / tour)
- [x] `Action` — WAKE, DRILL, BACK, HOME, OPEN_TARGET, IDLE_RESET, SET_LANG
- [x] Reducer — чистый, exhaustive через `assertNever`
- [x] `App.tsx` — `useReducer`, подписка на `onIdleReset`, репорт `reportActivity` по `pointerdown`
- [x] `AttractScreen.tsx` — `<video loop muted playsInline>`, hint-текст, `onPointerDown` → WAKE
- [x] Заглушки для экранов menu / map / tour (Phase 2-4)
- [x] `global.d.ts` — `window.kiosk: KioskApi`
- [x] Vite config + `index.html` (CSP, `cursor: none`, `user-select: none`)

### Тестовый актив
- [ ] `public/video/attract.mp4` — положить заглушку или реальный ролик после D1

### Проверка фазы
- [x] `typecheck` зелёный по всем пакетам после добавления React/Vite/Electron
- [ ] Smoke-запуск: `npm run build:main && npm run dev:renderer`, затем `npm run dev:main`

---

## Решения, которые надо снять

- [ ] **D1. ОС/архитектура киоска** (Windows / Linux / ARM). Блокирует Фазу 1 (видео-кодек, пакетирование) и Фазу 5.
- [ ] **D2. Узбекский: латиница / кириллица / обе.** Влияет на `i18n.json` и шрифты.
- [ ] **D3. Поведение фона в интерактиве** — подтвердить затемнение/заморозку.
- [ ] D4. Источник SVG-планов этажей.
- [ ] D5. Готовность 360-туров к MVP; чем закрывать листья без тура.

---

## Бэклог (разворачивать при активации)

- **Фаза 2 — меню.** Drill-down, i18n chrome, «Домой/Назад/крошки», переключатель языка, тач-цели 60-80 px.
- **Фаза 3 — 2D-карта.** Рендер SVG плана, кликабельные зоны, тап → `OPEN_TARGET`.
- **Фаза 4 — туры.** Встраивание panotour viewer, deep-link, выход → HOME.
- **Фаза 5 — закалка и сдача.** Блокировки жестов, авто-старт, пакетирование, инструкция для клиента.
