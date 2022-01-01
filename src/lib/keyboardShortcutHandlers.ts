import { handleShowHide, handleToggleChatList, handleToggleMute } from './gameEventHandlers';

export const addKeyboardShortcutListener = () => {
  addEventListener('keydown', (e: KeyboardEvent) => {
    if (document.activeElement.tagName !== 'INPUT') {
      if (e.code === 'KeyM') {
        handleToggleMute();
      } else if (e.code === 'KeyN') {
        handleShowHide();
      } else if (e.code === 'KeyC') {
        handleToggleChatList();
      }
    }
  });
};
