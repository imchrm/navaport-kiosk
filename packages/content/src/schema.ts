import { z } from 'zod';
import type { MenuNode, FloorMap } from './types.js';

const localized = z.object({
  uz: z.string(),
  ru: z.string(),
  en: z.string(),
});

const navTarget = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('tour'), tourId: z.string(), sceneId: z.string() }),
  z.object({ kind: z.literal('info'), body: localized }),
  z.object({ kind: z.literal('location'), mapId: z.string(), zoneId: z.string() }),
  z.object({ kind: z.literal('external'), ref: z.string() }),
]);

// Zod v3 infers optional fields as `T | undefined`, which conflicts with
// exactOptionalPropertyTypes. We annotate with the wider input type `unknown`
// and cast — runtime validation by Zod still catches bad data at the boundary.
const menuNode: z.ZodType<MenuNode, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('branch'),
      id: z.string(),
      title: localized,
      icon: z.string().optional(),
      children: z.array(menuNode),
    }),
    z.object({
      kind: z.literal('leaf'),
      id: z.string(),
      title: localized,
      icon: z.string().optional(),
      target: navTarget,
    }),
  ]),
) as z.ZodType<MenuNode, z.ZodTypeDef, unknown>;

export const navSchema = z.array(menuNode);

const zoneShape = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('rect'),
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }),
  z.object({
    kind: z.literal('polygon'),
    points: z.array(z.tuple([z.number(), z.number()])),
  }),
]);

const mapZone = z.object({
  id: z.string(),
  title: localized,
  shape: zoneShape,
  target: navTarget,
});

const floorMap: z.ZodType<FloorMap, z.ZodTypeDef, unknown> = z.object({
  id: z.string(),
  title: localized,
  svgAsset: z.string(),
  viewBox: z.string(),
  zones: z.array(mapZone),
}) as z.ZodType<FloorMap, z.ZodTypeDef, unknown>;

export const mapsSchema = z.array(floorMap);

export const i18nSchema = z.object({
  uz: z.record(z.string(), z.string()),
  ru: z.record(z.string(), z.string()),
  en: z.record(z.string(), z.string()),
});

export type I18nDict = z.infer<typeof i18nSchema>;
