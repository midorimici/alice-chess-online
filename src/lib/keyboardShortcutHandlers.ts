import { handleToggleMute } from './gameEventHandlers';

export const addKeyboardShortcutListener = () => {
  addEventListener('keydown', (e: KeyboardEvent) => {
    if (document.activeElement.tagName !== 'INPUT') {
      if (e.code === 'KeyM') {
        handleToggleMute();
      }
    }
  });
};
