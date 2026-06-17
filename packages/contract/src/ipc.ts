export interface KioskConfig {
  readonly idleTimeoutMs: number;
  readonly defaultLang: 'uz' | 'ru' | 'en';
  // Path is relative to the renderer's index.html (served by Vite or file://).
  // Codec choice depends on target hardware — see open decision D1.
  readonly attractVideoSrc: string;
}

export interface KioskApi {
  reportActivity(): void;
  onIdleReset(cb: () => void): () => void;
  getConfig(): Promise<KioskConfig>;
}
