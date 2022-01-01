import {
  handleHideChatList,
  handleShowHide,
  handleToggleChatList,
  handleToggleMute,
} from './gameEventHandlers';

export const addKeyboardShortcutListener = () => {
  addEventListener('keydown', (e: KeyboardEvent) => {
    const code = e.code;
    const activeEl = document.activeElement;
    // When the focus is not on any input
    if (activeEl.tagName !== 'INPUT') {
      registerKeyboardShortcut(code, 'KeyM', handleToggleMute);
      registerKeyboardShortcut(code, 'KeyN', handleShowHide);
      registerKeyboardShortcut(code, 'KeyC', handleToggleChatList);
    }
    // When the focus is on the chat input
    else if (activeEl.id === 'chat-input') {
      registerKeyboardShortcut(code, 'Escape', handleHideChatList);
    }
  });
};

const registerKeyboardShortcut = (code: string, key: string, callback: () => void) => {
  if (code === key) callback();
};
