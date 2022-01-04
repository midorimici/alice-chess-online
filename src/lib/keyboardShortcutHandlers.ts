import { digitRegisterState, isPromotingState, promotionCandidateIndexState } from '~/states';
import { useSetState, useState, useValue } from '~/states/stateManager';
import {
  handleHideChatList,
  handleShowHide,
  handleToggleChatList,
  handleToggleKeyHelp,
  handleToggleMute,
} from './gameEventHandlers';
import { drawBoard, handleBoardSelection, promote } from './gameHandlers';
import {
  handleDigitKeyInput,
  handleMoveDown,
  handleMoveLeft,
  handleMoveLeftDown,
  handleMoveLeftUp,
  handleMoveRight,
  handleMoveRightDown,
  handleMoveRightUp,
  handleMoveUp,
  handleSelectPromotionCandidate,
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
      if (code === 'Slash' && e.shiftKey) {
        handleToggleKeyHelp();
      }
    }
    // When the focus is on the chat input
    else if (activeEl.id === 'chat-input') {
      registerKeyboardShortcut(code, 'Escape', handleHideChatList);
    }
  });
};

const pieces: PieceName[] = ['N', 'B', 'R', 'Q'];

/**
 * Registers shortcut keys to manipulate board.
 * @param code The key inputted.
 * @param originPos The position of the piece that is selected.
 * @param destPos The destination position of the piece.
 * @param boardMap The current game board.
 * @param playerColor The color of the current player.
 * @param advanced2Pos The destination of the pawn that has moved two steps.
 * @param canCastle Lists that represent whether it is available to castle.
 * @returns `originPos`, `destPos`, `prom`
 */
export const setGameKeyboardShortcut = (
  code: string,
  originPos: Vector | null,
  destPos: Vector | null,
  boardMap: BoardMap,
  playerColor: PieceColor,
  advanced2Pos: number[] | null,
  canCastle: CastlingPotentials
): { originPos: Vector | null; destPos: Vector | null } => {
  // When the focus is not on any input
  if (document.activeElement.tagName !== 'INPUT') {
    const { value: isPromoting, setState: setIsPromoting } = useState(isPromotingState);
    if (isPromoting) {
      registerKeyboardShortcut(code, 'KeyH', () => handleSelectPromotionCandidate('left'));
      registerKeyboardShortcut(code, 'ArrowLeft', () => handleSelectPromotionCandidate('left'));
      registerKeyboardShortcut(code, 'KeyL', () => handleSelectPromotionCandidate('right'));
      registerKeyboardShortcut(code, 'ArrowRight', () => handleSelectPromotionCandidate('right'));
      registerKeyboardShortcut(code, 'Enter', () => {
        const promoteTo = useValue(promotionCandidateIndexState);
        promote(originPos, destPos, pieces[promoteTo]);
        setIsPromoting(false);
        return { originPos: null, destPos };
      });
      registerKeyboardShortcut(code, 'Escape', () => {
        setIsPromoting(false);
        drawBoard();
        return { originPos: null, destPos };
      });
    } else {
      registerKeyboardShortcut(code, 'Semicolon', handleSwitchActiveBoard);
      registerKeyboardShortcut(code, 'KeyH', handleMoveLeft);
      registerKeyboardShortcut(code, 'ArrowLeft', handleMoveLeft);
      registerKeyboardShortcut(code, 'KeyL', handleMoveRight);
      registerKeyboardShortcut(code, 'ArrowRight', handleMoveRight);
      registerKeyboardShortcut(code, 'KeyK', handleMoveUp);
      registerKeyboardShortcut(code, 'ArrowUp', handleMoveUp);
      registerKeyboardShortcut(code, 'KeyJ', handleMoveDown);
      registerKeyboardShortcut(code, 'ArrowDown', handleMoveDown);
      registerKeyboardShortcut(code, 'KeyE', handleMoveLeftUp);
      registerKeyboardShortcut(code, 'KeyD', handleMoveLeftDown);
      registerKeyboardShortcut(code, 'KeyR', handleMoveRightUp);
      registerKeyboardShortcut(code, 'KeyF', handleMoveRightDown);
      registerKeyboardShortcut(code, 'Digit1', () => handleDigitKeyInput(1));
      registerKeyboardShortcut(code, 'Digit2', () => handleDigitKeyInput(2));
      registerKeyboardShortcut(code, 'Digit3', () => handleDigitKeyInput(3));
      registerKeyboardShortcut(code, 'Digit4', () => handleDigitKeyInput(4));
      registerKeyboardShortcut(code, 'Digit5', () => handleDigitKeyInput(5));
      registerKeyboardShortcut(code, 'Digit6', () => handleDigitKeyInput(6));
      registerKeyboardShortcut(code, 'Digit7', () => handleDigitKeyInput(7));
      registerKeyboardShortcut(code, 'Digit8', () => handleDigitKeyInput(8));
      if (code === 'Enter') {
        const setDigitRegister = useSetState(digitRegisterState);
        setDigitRegister(null);
        return handleBoardSelection(
          originPos,
          destPos,
          boardMap,
          playerColor,
          advanced2Pos,
          canCastle
        );
      }
    }
  }
};

const registerKeyboardShortcut = (code: string, key: string, callback: () => void) => {
  if (code === key) callback();
};
