# TODO.md — navaport-kiosk

> Статус: **rolling**. Активная фаза — детально; будущие — крупными строками,
> разворачивать в задачи при переходе. Источник фаз — `ARCHITECTURE.md` §12.
>
> Формат: `- [ ]` открыто, `- [x]` сделано. Завершённое переносить в `CHANGELOG.md`
> и убирать отсюда, чтобы файл не разрастался.

---

## Сейчас — Фаза 0: каркас

Цель фазы: пустой, но строго типизированный монорепо, который грузит и валидирует
тестовый контент. Кода UI/Electron ещё нет.

### Репозиторий и тулчейн
- [x] `package.json` с `workspaces` (`packages/*`)
- [x] `tsconfig.base.json` — `strict: true`, плюс `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- [x] ESLint + Prettier, `.editorconfig` (UTF-8, LF)
- [x] Скелеты пакетов: `contract`, `content`, `main`, `renderer` (только `package.json` + `tsconfig` + пустой `src/index.ts`)
- [x] `npm run typecheck` как агрегирующий скрипт по всем пакетам

### Пакет `content`
- [x] `types.ts` — перенести типы из `ARCHITECTURE.md` §6 (`Localized`, `NavTarget`, `MenuNode`, `FloorMap`, `MapZone`, `ZoneShape`)
- [x] `assertNever` helper
- [x] `schema.ts` — Zod-схемы: `navTarget` (discriminatedUnion), `floorMap`, `navSchema`
- [x] Аккуратно типизировать рекурсивную схему меню (`z.lazy`) — без `ZodType<unknown>`, с явным `ZodType<MenuNode, ZodTypeDef, unknown>` и комментарием про Zod v3
- [x] `load.ts` — чтение JSON + валидация, **громкий fail на старте** при ошибке схемы

### Тестовый контент
- [x] `content/nav.json` — 2-3 узла: одна `branch`, один `leaf` с `target.kind = 'tour'`
- [x] `content/maps.json` — один `floor`, одна `zone` → `target` тур
- [x] `content/i18n.json` — строки chrome на `uz` (латиница, D2 TBD) / `ru` / `en`

### Проверка фазы
- [x] Smoke-тест: валидный контент парсится; намеренно битый JSON падает с понятным сообщением
- [x] `typecheck` зелёный по всем пакетам
- [x] Зафиксировать сделанное в `CHANGELOG.md`

---

## Решения, которые надо снять

Гейтят последующие фазы. Полный список — `ARCHITECTURE.md` → «Открытые решения».

- [ ] **D1. ОС/архитектура киоска** (Windows / Linux / ARM). Блокирует Фазу 1 (видео-кодек, пакетирование).
- [ ] **D2. Узбекский: латиница / кириллица / обе.** Влияет на `i18n.json` и шрифты. Пока: `uz` на латинице — заменить реальными строками после решения.
- [ ] **D3. Поведение фона в интерактиве** — подтвердить затемнение/заморозку при углублении в меню.
- [ ] D4. Источник SVG-планов этажей (готовы / рисовать).
- [ ] D5. Готовность 360-туров к MVP; чем закрывать листья без тура.

---

## Бэклог (разворачивать при активации)

- **Фаза 1 — shell + attract.** Kiosk-окно, attract-loop, idle-сброс, типизированный IPC + watchdog. *Старт после D1.*
- **Фаза 2 — меню.** Drill-down, i18n chrome, «Домой/Назад/крошки», переключатель языка, тач-цели 60-80 px.
- **Фаза 3 — 2D-карта.** Рендер SVG плана, кликабельные зоны (`rect`/`polygon`), тап → `OPEN_TARGET`.
- **Фаза 4 — туры.** Встраивание panotour viewer, deep-link `tourId`+`sceneId`, выход → `HOME`.
- **Фаза 5 — закалка и сдача.** Блокировки жестов, авто-старт, пакетирование, инструкция для клиента.
