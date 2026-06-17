# ARCHITECTURE.md — Airport Wayfinding Kiosk

> Рабочее имя проекта: `navaport-kiosk`.
> Статус документа: **stable**. Изменения архитектуры фиксируются здесь.
> Текущие нерешённые развилки — в разделе [Открытые решения](#открытые-решения) (**rolling**).

---

## 1. Назначение и границы

Информационный киоск для аэропорта на сенсорном экране (portrait). Задачи:

- attract-loop видео на простаивающем экране;
- навигация «по цели» — иерархичное меню категорий (2-3 уровня);
- навигация «по месту» — 2D-план этажа с кликабельными зонами;
- оба входа ведут в слой 360-туров (panotour), где находится фактическая глубина.

Целевой режим эксплуатации — **24/7 без оператора**, полностью офлайн (все ассеты локально). Языки интерфейса: `uz`, `ru`, `en`.

Вне рамок MVP: онлайн-табло рейсов, оплаты, печать, телеметрия. Спроектировать так, чтобы их можно было добавить, но не реализовывать.

---

## 2. Технологический стек и обоснование

| Слой | Выбор | Почему |
|------|-------|--------|
| Оболочка | Electron | Полный контроль над kiosk-режимом, жестами, авто-рестартом, офлайн и памятью при работе сутками. Браузер в `--kiosk` хрупче. |
| Renderer | React + Vite + TypeScript (strict) | Привычный стек; быстрый HMR при разработке. |
| Состояние | `useReducer` + дискриминированные actions | Без внешних зависимостей, полностью типизировано. Альтернатива — Zustand, если стор разрастётся. |
| Валидация данных | Zod | Контент грузится из JSON — runtime динамический. Валидируем один раз на границе (см. §6). |
| 360-туры | panotour viewer (Vanilla JS) | Существующий актив. Встраивается как зависимость, не переписывается. |
| Карта | Инлайн SVG + типизированные зоны | План этажа как SVG, зоны как геометрия в контенте. |
| Сборка/пакет | Vite (renderer) + electron-builder | Пакетирование под целевую ОС киоска (см. открытые решения). |

Философия типизации, под твой профиль: компилятор гарантирует корректность на стыках (sum-типы вместо «флагов», exhaustive-проверки), а всё, что приходит извне процесса (JSON-контент, IPC), проходит runtime-валидацию Zod на входе. Дальше по коду данные считаются доверенными и строго типизированными.

---

## 3. Структура монорепо

npm workspaces, как в `panotour`. Жёсткое разделение по процессам и ответственности.

```
navaport-kiosk/
  package.json                 # workspaces
  tsconfig.base.json           # strict: true, общие compilerOptions
  packages/
    contract/                  # типы IPC main <-> renderer (без рантайма)
    content/                   # модель контента: типы, zod-схемы, загрузчик, данные, i18n
    main/                      # Electron main process: окно, kiosk lifecycle, IPC
    renderer/                  # Vite + React + TS: экраны (attract, menu, map, tour-host)
  vendor/
    panotour-viewer/           # встроенный viewer (subtree/зависимость из panotour)
  assets/
    video/                     # attract-loop ролики
    maps/                      # SVG планов этажей
    tours/                     # тайлы/панорамы для panotour
  content/
    nav.json                   # дерево меню
    maps.json                  # планы + зоны
    i18n.json                  # строки интерфейса (chrome)
```

Зависимости направлены строго: `contract` ← `main`, `renderer`; `content` ← `renderer`. `main` и `renderer` не импортируют друг друга напрямую — только через типизированный IPC из `contract`.

---

## 4. Подсистемы и их границы

1. **Shell (`main`).** Создаёт kiosk-окно (fullscreen, frameless, kiosk), управляет жизненным циклом (см. §10), предоставляет типизированный IPC. Renderer не имеет прямого доступа к Node — только через `preload` bridge.
2. **Content model (`content`).** Единственный источник правды о структуре навигации, картах и i18n. Грузит и валидирует JSON, отдаёт renderer уже типизированные деревья.
3. **Video (renderer).** Attract-loop: бесшовный цикл (две `<video>` с кроссфейдом либо чистая нарезка стыка), `muted` + `playsInline`. При входе в интерактив — затемнение/заморозка фона, чтобы текст читался и декодер разгружался.
4. **Menu (renderer).** Drill-down по дереву: плитки на главной, переход вглубь по тапу, постоянные «Домой» / «Назад» / хлебные крошки / переключатель языка. Без hover.
5. **2D Map (renderer, в MVP).** Рендер SVG-плана, кликабельные зоны, тап по зоне → `NavTarget` (обычно тур). Второй вход в тот же слой туров.
6. **Tour host (renderer + vendor).** Встраивает panotour viewer, открывает по deep-link `tourId` + `sceneId`. Внутреннюю навигацию (хотспоты между панорамами) ведёт сам viewer.
7. **Kiosk lifecycle (main + renderer).** Idle-таймер, сброс на attract, блокировки жестов, защита от засыпания, авто-рестарт.

---

## 5. Модель навигации (две оси)

Меню и карта — два оглавления к одному «телу» (туры). Глубина не в дереве меню (предел — 3 тапа до листа), а в графе панорам.

```
Меню «по цели» (2-3 уровня) ─┐
                             ├─→ Точка входа в локацию ─→ 360-тур (граф панорам)
Карта этажа (2D-план) ───────┘
```

Несколько терминалов (если будут) — не отдельный уровень меню, а контекст-переключатель рядом с языком, чтобы не раздувать дерево.

---

## 6. Модель контента (типы)

Ключевой принцип: **branch xor leaf** выражен типом, а не опциональными полями. Узел либо ветка с детьми, либо лист с таргетом — третьего не дано, и компилятор это держит.

```typescript
// packages/content/src/types.ts

export type LangCode = 'uz' | 'ru' | 'en';
export type Localized = Readonly<Record<LangCode, string>>;

// --- Навигационный таргет: дискриминированное объединение ---
export type NavTarget =
  | { readonly kind: 'tour'; readonly tourId: string; readonly sceneId: string }
  | { readonly kind: 'info'; readonly body: Localized }
  | { readonly kind: 'location'; readonly mapId: string; readonly zoneId: string }
  | { readonly kind: 'external'; readonly ref: string };

// --- Узел меню: ветка либо лист ---
interface MenuNodeBase {
  readonly id: string;
  readonly title: Localized;
  readonly icon?: string;
}

export interface MenuBranch extends MenuNodeBase {
  readonly kind: 'branch';
  readonly children: readonly MenuNode[];
}

export interface MenuLeaf extends MenuNodeBase {
  readonly kind: 'leaf';
  readonly target: NavTarget;
}

export type MenuNode = MenuBranch | MenuLeaf;

// --- 2D-карта ---
export type ZoneShape =
  | { readonly kind: 'rect'; readonly x: number; readonly y: number; readonly w: number; readonly h: number }
  | { readonly kind: 'polygon'; readonly points: readonly (readonly [number, number])[] };

export interface MapZone {
  readonly id: string;
  readonly title: Localized;
  readonly shape: ZoneShape;
  readonly target: NavTarget; // как правило { kind: 'tour', ... }
}

export interface FloorMap {
  readonly id: string;
  readonly title: Localized;
  readonly svgAsset: string;            // путь к SVG плана
  readonly zones: readonly MapZone[];
}
```

Exhaustiveness — аналог обязательного `match` по sum-типу. Если в `NavTarget` добавится новый `kind`, любой такой `switch` перестанет компилироваться, пока его не обработают:

```typescript
export function assertNever(x: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(x)}`);
}

function resolveTarget(t: NavTarget): KioskScreen {
  switch (t.kind) {
    case 'tour':     return { kind: 'tour', tourId: t.tourId, sceneId: t.sceneId };
    case 'location': return { kind: 'map', floorId: t.mapId };
    case 'info':     /* открыть инфо-карточку */ return { kind: 'attract' };
    case 'external': /* зарезервировано */       return { kind: 'attract' };
    default:         return assertNever(t);
  }
}
```

Runtime-граница: контент-JSON валидируется Zod один раз при старте. Дальше типы доверенные.

```typescript
// packages/content/src/schema.ts (эскиз)
import { z } from 'zod';

const localized = z.object({ uz: z.string(), ru: z.string(), en: z.string() });

const navTarget = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('tour'), tourId: z.string(), sceneId: z.string() }),
  z.object({ kind: z.literal('info'), body: localized }),
  z.object({ kind: z.literal('location'), mapId: z.string(), zoneId: z.string() }),
  z.object({ kind: z.literal('external'), ref: z.string() }),
]);

const menuNode: z.ZodType<unknown> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('branch'), id: z.string(), title: localized,
               icon: z.string().optional(), children: z.array(menuNode) }),
    z.object({ kind: z.literal('leaf'), id: z.string(), title: localized,
               icon: z.string().optional(), target: navTarget }),
  ]),
);

export const navSchema = z.array(menuNode);
```

Загрузчик (`content/src/load.ts`) читает файлы, прогоняет через схемы, при ошибке падает громко на старте (а не молча в проде). Контент редактируется без участия программиста — это требование тендера.

---

## 7. Состояние и экраны

Один типизированный конечный набор экранов; idle-таймер всегда возвращает к `attract`.

```typescript
// packages/renderer/src/state/screen.ts
export type KioskScreen =
  | { readonly kind: 'attract' }
  | { readonly kind: 'menu'; readonly path: readonly string[] } // breadcrumb из id узлов
  | { readonly kind: 'map'; readonly floorId: string }
  | { readonly kind: 'tour'; readonly tourId: string; readonly sceneId: string };

export type Action =
  | { type: 'WAKE' }                          // касание на attract
  | { type: 'DRILL'; nodeId: string }
  | { type: 'BACK' }
  | { type: 'HOME' }
  | { type: 'OPEN_TARGET'; target: NavTarget }
  | { type: 'IDLE_RESET' }
  | { type: 'SET_LANG'; lang: LangCode };
```

Reducer чистый, без побочных эффектов; навигация по дереву — операции над `path`. Текущий язык — часть глобального состояния, прокидывается селектором `pick(localized, lang)`.

---

## 8. Интернационализация

- Контентные строки локализованы в самих данных (`Localized`).
- Строки интерфейса (chrome: «Назад», «Домой», подписи) — отдельный типизированный словарь `content/i18n.json`, ключи проверяются типом.
- Все три языка LTR — RTL не нужен.
- Переключатель языка постоянно доступен на всех экранах, кроме `attract`. На `attract` показывается мультиязычная подсказка «коснитесь экрана».

> Развилка по узбекскому: латиница или кириллица (или обе). См. открытые решения — влияет на словари и шрифты.

---

## 9. Интеграция panotour

- Viewer встраивается из `panotour` (subtree или версионированная зависимость в `vendor/`).
- Контракт узкий: `openTour(tourId, sceneId)` и событие `onExit` → `HOME`.
- Renderer не лезет во внутреннюю навигацию тура; глубина (хотспоты, переходы панорам) — зона ответственности viewer.
- Тайлы туров лежат в `assets/tours/`, грузятся локально.

---

## 10. Жизненный цикл киоска (24/7)

То, что обычно забывают и что критично для тендера:

- **Idle-таймер:** после N секунд без касания → `IDLE_RESET` → `attract`. N в конфиге.
- **Авто-старт** при загрузке ОС; **single-instance**; **авто-рестарт** при падении renderer (`app.relaunch`).
- **Блокировки:** контекстное меню, выделение текста, pinch-zoom, pull-to-refresh, drag-and-drop, F-клавиши, скрытие курсора.
- **Экран не гаснет:** `powerSaveBlocker`.
- **Память:** следить за утечками при многосуточной работе; периодический мягкий reload renderer по таймеру low-traffic как страховка.
- **Офлайн:** ни одного сетевого запроса; все ассеты локальны.

---

## 11. Типизированный IPC

Граница main ↔ renderer описана в `contract` и пробрасывается через `preload`. Никаких «магических строк» каналов в коде — только типизированный фасад.

```typescript
// packages/contract/src/ipc.ts
export interface KioskApi {
  reportActivity(): void;                 // renderer -> main: сброс watchdog
  onIdleReset(cb: () => void): () => void; // main -> renderer
  getConfig(): Promise<KioskConfig>;
}
```

`preload` реализует `KioskApi` поверх `ipcRenderer`, в renderer он виден как `window.kiosk: KioskApi` (тип объявить в `renderer/src/global.d.ts`).

---

## 12. Порядок реализации

Карта входит в MVP, поэтому она в основной последовательности, а не «потом».

- **Фаза 0 — каркас.** Workspaces, `tsconfig` strict, схемы Zod, загрузчик, тестовый контент (по 2-3 узла, одна карта, один тур).
- **Фаза 1 — shell + attract.** Kiosk-окно, attract-loop видео, idle-сброс, типизированный IPC и watchdog.
- **Фаза 2 — меню.** Drill-down по дереву, i18n chrome, «Домой/Назад/крошки», переключатель языка, тач-цели 60-80 px.
- **Фаза 3 — 2D-карта.** Рендер SVG плана, кликабельные зоны (`rect`/`polygon`), тап → `OPEN_TARGET`.
- **Фаза 4 — туры.** Встраивание panotour viewer, deep-link `tourId`+`sceneId`, выход → `HOME`.
- **Фаза 5 — закалка и сдача.** Блокировки, авто-старт, пакетирование, инструкция «как поменять пункт меню/зону» для клиента.

---

## Открытые решения

> **rolling** — дополнять по мере прояснения. Каждое влияет на реализацию.

1. **ОС и архитектура киоска** (Windows / Linux / ARM). Определяет аппаратный декод видео и target пакетирования. Без этого нельзя финализировать кодек attract-loop.
2. **Узбекский: латиница или кириллица** (или обе). Влияет на i18n-словари и набор шрифтов.
3. **Поведение фона в интерактиве.** Ранее выбран «вечный луп», но для читаемости меню предложено затемнение/заморозка при углублении. Подтвердить итоговое поведение.
4. **Источник планов этажей.** Есть ли готовые SVG-планы, или их нужно отрисовать/векторизовать.
5. **Готовность контента туров к MVP.** Сколько локаций реально имеют 360-туры на момент сдачи; чем закрывать листья без тура (инфо-карточка).
6. **Несколько терминалов?** Если да — подтвердить модель контекст-переключателя вместо уровня меню.
7. **Ориентация и разрешение экрана** киоска (фиксированные) — для бюджета битрейта видео и вёрстки.