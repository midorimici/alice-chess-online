import { EASY_MOTION_AVAILABLE_KEYS } from '~/config';
import { digitRegisterState, isPromotingState, promotionCandidateIndexState } from '~/states';
import { easyMotionWaitingState } from '~/states/game';
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
  handleEasyMotion,
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
    const key = e.key;
    const activeEl = document.activeElement;
    // When the focus is not on any input
    if (activeEl.tagName !== 'INPUT') {
      registerKeyboardShortcut(key, 'M', handleToggleMute);
      registerKeyboardShortcut(key, '<', handleShowHide);
      registerKeyboardShortcut(key, 'C', handleToggleChatList);
      if (key === '?') {
        handleToggleKeyHelp();
      }
    }
    // When the focus is on the chat input
    else if (activeEl.id === 'chat-input') {
      registerKeyboardShortcut(key, 'Escape', handleHideChatList);
    }
  });
};

const pieces: PieceName[] = ['N', 'B', 'R', 'Q'];

/**
 * Registers shortcut keys to manipulate board.
 * @param key The key inputted.
 * @param originPos The position of the piece that is selected.
 * @param destPos The destination position of the piece.
 * @param boardMap The current game board.
 * @param playerColor The color of the current player.
 * @param advanced2Pos The destination of the pawn that has moved two steps.
 * @param canCastle Lists that represent whether it is available to castle.
 * @returns `originPos`, `destPos`, `prom`
 */
export const setGameKeyboardShortcut = (
  key: string,
  originPos: Vector | null,
  destPos: Vector | null,
  boardMap: BoardMap,
  playerColor: PieceColor,
  advanced2Pos: number[] | null,
  canCastle: CastlingPotentials
): { originPos: Vector | null; destPos: Vector | null } => {
  // When the focus is not on any input
  if (document.activeElement.tagName === 'INPUT') {
    return;
  }

  const { value: isPromoting, setState: setIsPromoting } = useState(isPromotingState);
  if (isPromoting) {
    registerKeyboardShortcut(key, 'h', () => handleSelectPromotionCandidate('left'));
    registerKeyboardShortcut(key, 'ArrowLeft', () => handleSelectPromotionCandidate('left'));
    registerKeyboardShortcut(key, 'l', () => handleSelectPromotionCandidate('right'));
    registerKeyboardShortcut(key, 'ArrowRight', () => handleSelectPromotionCandidate('right'));
    registerKeyboardShortcut(key, 'Enter', () => {
      const promoteTo = useValue(promotionCandidateIndexState);
      promote(originPos, destPos, pieces[promoteTo]);
      setIsPromoting(false);
      return { originPos: null, destPos };
    });
    registerKeyboardShortcut(key, 'Escape', () => {
      setIsPromoting(false);
      drawBoard();
      return { originPos: null, destPos };
    });
  } else {
    // Go to a specified piece directly with easy motion.
    registerKeyboardShortcut(key, ' ', () => handleEasyMotion(' '));
    const easyMotionWaiting = useValue(easyMotionWaitingState);
    if (easyMotionWaiting) {
      for (const keyName of EASY_MOTION_AVAILABLE_KEYS) {
        registerKeyboardShortcut(key, keyName, () => handleEasyMotion(keyName));
      }
      return;
    }

    // Switch active board.
    registerKeyboardShortcut(key, ';', handleSwitchActiveBoard);

    // Navigate selecting position.
    registerKeyboardShortcut(key, 'h', handleMoveLeft);
    registerKeyboardShortcut(key, 'ArrowLeft', handleMoveLeft);
    registerKeyboardShortcut(key, 'l', handleMoveRight);
    registerKeyboardShortcut(key, 'ArrowRight', handleMoveRight);
    registerKeyboardShortcut(key, 'k', handleMoveUp);
    registerKeyboardShortcut(key, 'ArrowUp', handleMoveUp);
    registerKeyboardShortcut(key, 'j', handleMoveDown);
    registerKeyboardShortcut(key, 'ArrowDown', handleMoveDown);
    registerKeyboardShortcut(key, 'e', handleMoveLeftUp);
    registerKeyboardShortcut(key, 'd', handleMoveLeftDown);
    registerKeyboardShortcut(key, 'r', handleMoveRightUp);
    registerKeyboardShortcut(key, 'f', handleMoveRightDown);

    // Go to a specified square directly with file and rank numbers.
    for (let i = 1; i <= 8; i++) {
      registerKeyboardShortcut(key, `${i}`, () => handleDigitKeyInput(i));
    }

    // Activate the selected square.
    if (key === 'Enter') {
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
};

const registerKeyboardShortcut = (key: string, keyName: string, callback: () => void) => {
  if (key === keyName) callback();
};
