# Changelog — Airport Wayfinding Kiosk

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