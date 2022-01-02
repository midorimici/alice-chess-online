import {
  handleHideChatList,
  handleShowHide,
  handleToggleChatList,
  handleToggleMute,
} from './gameEventHandlers';
import {
  handleMoveDown,
  handleMoveLeft,
  handleMoveLeftDown,
  handleMoveLeftUp,
  handleMoveRight,
  handleMoveRightDown,
  handleMoveRightUp,
  handleMoveUp,
  handleSwitchActiveBoard,
} from './gameKeyboardHandlers';

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
      registerKeyboardShortcut(code, 'KeyH', handleMoveLeft);
      registerKeyboardShortcut(code, 'KeyL', handleMoveRight);
      registerKeyboardShortcut(code, 'KeyK', handleMoveUp);
      registerKeyboardShortcut(code, 'KeyJ', handleMoveDown);
      registerKeyboardShortcut(code, 'KeyE', handleMoveLeftUp);
      registerKeyboardShortcut(code, 'KeyD', handleMoveLeftDown);
      registerKeyboardShortcut(code, 'KeyR', handleMoveRightUp);
      registerKeyboardShortcut(code, 'KeyF', handleMoveRightDown);
    }
  };
};

export const cancelGameKeyboardShortcutListener = () => (document.onkeydown = () => {});

const registerKeyboardShortcut = (code: string, key: string, callback: () => void) => {
  if (code === key) callback();
};
