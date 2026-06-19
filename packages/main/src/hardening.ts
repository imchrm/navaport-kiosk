import { app, globalShortcut } from 'electron';

// Swallowed in production kiosk mode.
// OS-level sequences (Ctrl+Alt+Del, Win key alone, Alt+Tab) cannot be
// intercepted from userspace on Windows — use Assigned Access or Group
// Policy for those if needed.
const BLOCKED_SHORTCUTS = [
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'Alt+F4',
  'Ctrl+W',
  'Ctrl+R',
  'Ctrl+Shift+I',
  'Ctrl+Shift+Escape',
  'Alt+Escape',
  'PrintScreen',
];

export function setupHardening(): void {
  if (process.env['NODE_ENV'] === 'development') return;

  for (const shortcut of BLOCKED_SHORTCUTS) {
    globalShortcut.register(shortcut, () => undefined);
  }

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
}
