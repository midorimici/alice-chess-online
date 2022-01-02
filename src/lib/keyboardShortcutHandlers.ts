import {
  handleHideChatList,
  handleShowHide,
  handleToggleChatList,
  handleToggleMute,
} from './gameEventHandlers';
import { handleSwitchActiveBoard } from './gameKeyboardHandlers';

export const addKeyboardShortcutListener = () => {
  addEventListener('keyup', (e: KeyboardEvent) => {
    const code = e.code;
    const activeEl = document.activeElement;
    // When the focus is not on any input
    if (activeEl.tagName !== 'INPUT') {
      registerKeyboardShortcut(code, 'KeyM', handleToggleMute);
      registerKeyboardShortcut(code, 'Comma', handleShowHide);
      registerKeyboardShortcut(code, 'KeyC', handleToggleChatList);
    }
    // When the focus is on the chat input
    else if (activeEl.id === 'chat-input') {
      registerKeyboardShortcut(code, 'Escape', handleHideChatList);
    }
  });
};

export const setGameKeyboardShortcutListener = () => {
  document.onkeydown = (e: KeyboardEvent) => {
    const code = e.code;
    // When the focus is not on any input
    if (document.activeElement.tagName !== 'INPUT') {
      registerKeyboardShortcut(code, 'Semicolon', handleSwitchActiveBoard);
    }
  };
};

export const cancelGameKeyboardShortcutListener = () => (document.onkeydown = () => {});

const registerKeyboardShortcut = (code: string, key: string, callback: () => void) => {
  if (code === key) callback();
};
