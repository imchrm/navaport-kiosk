import type { KioskApi } from '@navaport/contract';

export {};

declare global {
  interface Window {
    readonly kiosk: KioskApi;
  }
}
