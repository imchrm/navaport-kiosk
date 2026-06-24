export interface KioskConfig {
  readonly menuIdleTimeoutMs: number;
  readonly tourIdleTimeoutMs: number;
  readonly defaultLang: 'uz' | 'ru' | 'en';
  // Path relative to renderer's index.html. Codec TBD — see open decision D1.
  readonly attractVideoSrc: string;
  // Base URL for tour iframes: `${tourBaseUrl}/${tourId}?lang=XX&scene=YY`
  readonly tourBaseUrl: string;
}

export interface KioskApi {
  reportActivity(): void;
  // Inform main process when a tour iframe is active so the longer idle timeout is used.
  setTourActive(active: boolean): void;
  onIdleReset(cb: () => void): () => void;
  getConfig(): Promise<KioskConfig>;
  // Returns raw content JSON; renderer validates at the IPC boundary using Zod.
  getContent(): Promise<unknown>;
}
