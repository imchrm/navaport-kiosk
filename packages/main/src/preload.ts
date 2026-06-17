import { contextBridge, ipcRenderer } from 'electron';
import type { KioskApi, KioskConfig } from '@navaport/contract';

const api: KioskApi = {
  reportActivity(): void {
    ipcRenderer.send('kiosk:reportActivity');
  },

  onIdleReset(cb: () => void): () => void {
    const handler = () => cb();
    ipcRenderer.on('kiosk:idleReset', handler);
    return () => {
      ipcRenderer.off('kiosk:idleReset', handler);
    };
  },

  getConfig(): Promise<KioskConfig> {
    return ipcRenderer.invoke('kiosk:getConfig') as Promise<KioskConfig>;
  },
};

contextBridge.exposeInMainWorld('kiosk', api);
