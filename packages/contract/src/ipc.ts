export interface KioskConfig {
  readonly idleTimeoutMs: number;
  readonly defaultLang: 'uz' | 'ru' | 'en';
}

export interface KioskApi {
  reportActivity(): void;
  onIdleReset(cb: () => void): () => void;
  getConfig(): Promise<KioskConfig>;
}
