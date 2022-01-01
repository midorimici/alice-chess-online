import { handleShowHide, handleToggleChatList, handleToggleMute } from './gameEventHandlers';

export const addKeyboardShortcutListener = () => {
  addEventListener('keydown', (e: KeyboardEvent) => {
    const code = e.code;
    if (document.activeElement.tagName !== 'INPUT') {
      registerKeyboardShortcut(code, 'KeyM', handleToggleMute);
      registerKeyboardShortcut(code, 'KeyN', handleShowHide);
      registerKeyboardShortcut(code, 'KeyC', handleToggleChatList);
    }
  });
};

const registerKeyboardShortcut = (code: string, key: string, callback: () => void) => {
  if (code === key) callback();
};
