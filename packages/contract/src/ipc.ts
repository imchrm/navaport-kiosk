export interface KioskConfig {
  readonly idleTimeoutMs: number;
  readonly defaultLang: 'uz' | 'ru' | 'en';
  // Path relative to renderer's index.html. Codec TBD — see open decision D1.
  readonly attractVideoSrc: string;
}

export interface KioskApi {
  reportActivity(): void;
  onIdleReset(cb: () => void): () => void;
  getConfig(): Promise<KioskConfig>;
  // Returns raw content JSON; renderer validates at the IPC boundary using Zod.
  getContent(): Promise<unknown>;
}
