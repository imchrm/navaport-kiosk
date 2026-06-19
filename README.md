# navaport-kiosk

Информационный киоск аэропорта на сенсорном экране (portrait, 24/7, полностью офлайн). Три способа найти нужное: attract-loop видео на простое, иерархичное меню «по цели» и 2D-план этажа «по месту». Оба входа ведут в 360-туры. Языки интерфейса: `uz`, `ru`, `en`.

> **Статус:** MVP реализован (Фазы 0–5 завершены). Готов к финальному тестированию и упаковке.

---

## Возможности

- Attract-loop видео на простаивающем экране до первого касания.
- Иерархичное меню (2-3 уровня), drill-down по тапу, без hover.
- 2D-план этажа с кликабельными зонами.
- 360-туры через panotour (встраивается iframe).
- Мультиязычность `uz` / `ru` / `en`, переключение на лету.
- Контент (пункты меню, зоны) редактируется без программиста — правка JSON-файлов.
- Режим киоска: idle-сброс (60 с), авто-старт Windows, блокировки системных шорткатов, экран не гаснет.

---

## Стек

Electron · React · Vite · TypeScript (strict) · Zod · npm workspaces. Целевая ОС — **Windows x64**. 360-туры встраиваются через `<iframe>` на panotour. Подробности и обоснование — в `docs/ARCHITECTURE.md`.

---

## Структура (кратко)

```
packages/
  contract/    типы IPC main <-> renderer (без рантайма)
  content/     типы, Zod-схемы, загрузчик
  main/        Electron main: окно, kiosk lifecycle, IPC, тур-сервер, hardening
  renderer/    Vite + React: экраны (attract, menu, map, tour-host)
content/       nav.json, maps.json, i18n.json  ← редактируемый контент
electron-builder.json5  конфиг упаковки
```

Полная схема и границы подсистем — `docs/ARCHITECTURE.md` §3-4.

---

## Требования

- Node.js LTS и npm (поддержка workspaces).
- Разработка и целевая ОС: **Windows**, команды — PowerShell.

---

## Установка

```powershell
npm install
```

---

## Разработка

В двух терминалах:

```powershell
# Терминал 1: renderer (Vite dev-сервер, http://localhost:5173)
npm run dev:renderer

# Терминал 2: main (после сборки main хотя бы один раз)
npm run build:main
npm run dev:main
```

Окно разработки: 540×960 portrait, с DevTools.

---

## Команды

| Команда | Действие |
|---------|----------|
| `npm run typecheck` | Проверка TypeScript по всем пакетам |
| `npm test` | Тесты (vitest, пакет `content`) |
| `npm run lint` | ESLint по всем пакетам |
| `npm run build:main` | Компиляция main (tsc) |
| `npm run build:renderer` | Бандл renderer (Vite) |
| `npm run build` | `build:main` + `build:renderer` |
| `npm run pack` | Собрать без инсталлятора (`dist-electron/`) |
| `npm run dist` | NSIS-инсталлятор + portable .exe (`dist-electron/`) |

---

## Упаковка (Windows)

```powershell
# Нужно подготовить заранее:
# 1. Заполнить tours/ бандлами panotour
# 2. Добавить build-resources/icon.ico (256x256)
# 3. Раскомментировать tours в extraResources (electron-builder.json5)

npm run dist
# Результат: dist-electron/Navaport Kiosk Setup *.exe (NSIS)
#             dist-electron/Navaport Kiosk *.exe      (portable)
```

Параметры упаковки — `electron-builder.json5`.

---

## Контент

Все данные навигации лежат в `content/` — редактируются без программиста:

| Файл | Назначение |
|------|------------|
| `content/nav.json` | Дерево меню: branches и leaves с NavTarget |
| `content/maps.json` | Планы этажей, зоны (`rect`/`polygon`), привязки к турам |
| `content/i18n.json` | Строки интерфейса (chrome) на uz/ru/en |

При старте приложения данные валидируются Zod. Ошибка в JSON — громкое падение на старте.

---

## 360-туры

Туры встраиваются через `<iframe>`. URL строится как:

```
${tourBaseUrl}/${tourId}?lang=XX&scene=YY
```

- В dev: `tourBaseUrl = https://360tur.uz/tours` (внешний сервер).
- В prod: `tourBaseUrl = http://localhost:51440/tours` (локальный HTTP-сервер из `tours/` через `process.resourcesPath`).

Выход из тура — `postMessage({ type: 'TOUR_EXIT' })` от panotour → HOME. Пока не реализовано в panotour — работает fallback-кнопка «‹».

---

## Документация

| Файл | Назначение |
|------|------------|
| `docs/CONTEXT.md` | Снимок проекта, среда, конвенции, глоссарий |
| `docs/ARCHITECTURE.md` | Структура системы, подсистемы, модель контента |
| `docs/TODO.md` | Активные задачи и открытые решения |
| `docs/CHANGELOG.md` | История изменений |
| `CLAUDE.md` | Инструкции для Claude Code |

---

## Лицензия

Проприетарный проект (клиент/тендер). Условия использования уточняются — заменить на актуальные перед публикацией.
