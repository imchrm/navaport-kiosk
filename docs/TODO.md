# TODO.md — navaport-kiosk

> Статус: **rolling**. Активная фаза — детально; будущие — крупными строками,
> разворачивать в задачи при переходе. Источник фаз — `ARCHITECTURE.md` §12.
>
> Формат: `- [ ]` открыто, `- [x]` сделано. Завершённое переносить в `CHANGELOG.md`
> и убирать отсюда, чтобы файл не разрастался.

---

## Сейчас — Фаза 3: 2D-карта

Цель фазы: рендер SVG-плана этажа, кликабельные зоны, тап → `OPEN_TARGET`.

- [x] `MapScreen.tsx` — компонент экрана карты
- [x] `FloorMap.viewBox` добавлен в тип и Zod-схему; зоны рендерятся в одном SVG-пространстве
- [x] SVG `<image>` + SVG `<rect>`/`<polygon>` оверлеи, все в одном `<svg viewBox>`
- [x] Поддержка `ZoneShape`: `rect` и `polygon`; exhaustive через `assertNever`
- [x] Тап по зоне → `dispatch({ type: 'OPEN_TARGET', target: zone.target })`
- [x] NavBar переиспользован (breadcrumb = название этажа, BACK/HOME → menu root)
- [x] Fixture `content/maps.json`: 3 зоны — rect, polygon, rect (3 разных `target`)
- [x] Заглушка `renderer/public/assets/maps/floor-1.svg` — схематичный план терминала

### Тестовый актив
- [x] `public/video/attract.mp4` — видео добавлено (MP4, 13 МБ, portrait)
- [ ] Заменить placeholder SVG реальным планом после решения D4

### Проверка фазы
- [x] Клик по зоне `rect`/`polygon` → правильный `target` через reducer (assertNever-покрытый)
- [x] `typecheck` зелёный по всем пакетам; content smoke-тесты 8/8 зелёных

---

## Решения, которые надо снять

- [ ] **D1. ОС/архитектура киоска** (Windows / Linux / ARM). Блокирует Фазу 5.
- [x] **D2. Узбекский: латиница / кириллица / обе.** — Латиница. Принято 2026-06-17.
- [x] **D3. Поведение фона в интерактиве.** — Видео всегда играет; при входе в меню
  затемнение 0.42; при нажатии кнопки видео паузируется + затемнение 0.72/0.80;
  через 5 сек без действий — сброс в attract (видео снова играет). Принято 2026-06-17.
- [ ] **D4. Источник SVG-планов этажей.**
- [ ] **D5. Готовность 360-туров к MVP; чем закрывать листья без тура.**

---

## Сейчас — Фаза 4: туры

- [x] `TourScreen.tsx` — полноэкранный iframe; URL: `${tourBaseUrl}/${tourId}?lang=XX&scene=YY`
- [x] `postMessage` listener: `{ type: 'TOUR_EXIT' }` → HOME
- [x] Fallback-кнопка «‹» поверх iframe (пока panotour не реализует TOUR_EXIT)
- [x] `KioskConfig.tourBaseUrl` добавлен в contract и ipc-main
- [x] `nav.json` — tourId обновлены до реальных путей 360tur.uz
- [x] `maps.json` — зоны привязаны к реальным tourId
- [x] CSP обновлён: `frame-src https://360tur.uz`
- [x] Dev-окно исправлено на portrait 540×960
- [ ] Переключить `tourBaseUrl` на локальный сервер для продакшна (Фаза 5)
- [ ] Убрать fallback-кнопку после реализации TOUR_EXIT в panotour

## Бэклог (разворачивать при активации)

- **Фаза 5 — закалка и сдача.** Блокировки жестов, авто-старт, пакетирование,
  локальный сервер туров, инструкция для клиента. Блокируется D1.
