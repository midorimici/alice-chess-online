import {
  handleHideChatList,
  handleShowHide,
  handleToggleChatList,
  handleToggleMute,
} from './gameEventHandlers';
import { handleBoardSelection } from './gameHandlers';
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

/** Adds keyup listener to manipulate mute, opposite pieces visibility, and chat list. */
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

/**
 * Registers shortcut keys to manipulate board.
 * @param code The key inputted.
 * @param originPos The position of the piece that is selected.
 * @param destPos The destination position of the piece.
 * @param prom Whether it is available to promote.
 * @param boardMap The current game board.
 * @param playerColor The color of the current player.
 * @param advanced2Pos The destination of the pawn that has moved two steps.
 * @param canCastle Lists that represent whether it is available to castle.
 * @returns `originPos`, `destPos`, `prom`
 */
export const setGameKeyboardShortcut = (
  code: string,
  originPos: Vector,
  destPos: Vector,
  prom: boolean,
  boardMap: BoardMap,
  playerColor: PieceColor,
  advanced2Pos: number[] | null,
  canCastle: CastlingPotentials
) => {
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
    if (code === 'Enter') {
      return handleBoardSelection(
        originPos,
        destPos,
        prom,
        boardMap,
        playerColor,
        advanced2Pos,
        canCastle
      );
    }
  }
};

const registerKeyboardShortcut = (code: string, key: string, callback: () => void) => {
  if (code === key) callback();
};
