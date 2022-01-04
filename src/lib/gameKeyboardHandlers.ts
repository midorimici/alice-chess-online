import { BOARD_MAX_INDEX } from '~/config';
import {
  activeBoardState,
  focusedPositionState,
  lastMovedPiecePositionState,
  promotionCandidateIndexState,
} from '~/states';
import { useSetState, useState, useValue } from '~/states/stateManager';
import { drawBoard } from './gameHandlers';

const ulim = (val: number) => Math.min(val, BOARD_MAX_INDEX);

const llim = (val: number) => Math.max(val, 0);

const center = () => Math.floor(BOARD_MAX_INDEX / 2);

const handleNavigation = (
  action: (x: number, y: number, setFocusedPosition: (state: Vector) => void) => void
) => {
  const { value: focusedPosition, setState: setFocusedPosition } = useState(focusedPositionState);
  const setActiveBoard = useSetState(activeBoardState);
  if (focusedPosition === null) {
    const lastMovedPiecePosition = useValue(lastMovedPiecePositionState);
    const { board, x, y } = lastMovedPiecePosition ?? { board: 0, x: center(), y: center() };
    setActiveBoard(board);
    setFocusedPosition([x, y]);
  } else {
    action(...focusedPosition, setFocusedPosition);
  }
  drawBoard();
};

/** Moves the focused square to the opposite board. */
export const handleSwitchActiveBoard = () => {
  const { value: activeBoard, setState: setActiveBoard } = useState(activeBoardState);
  handleNavigation(() => setActiveBoard((1 - activeBoard) as BoardId));
};

/** Navigates the focused square left. */
export const handleMoveLeft = () => {
  handleNavigation((x, y, setFocusedPosition) => {
    if (x <= 0) {
      return;
    }

    const newPosition: Vector = [x - 1, y];
    setFocusedPosition(newPosition);
  });
};

/** Navigates the focused square right. */
export const handleMoveRight = () => {
  handleNavigation((x, y, setFocusedPosition) => {
    if (x >= BOARD_MAX_INDEX) {
      return;
    }

    const newPosition: Vector = [x + 1, y];
    setFocusedPosition(newPosition);
  });
};

/** Navigates the focused square up. */
export const handleMoveUp = () => {
  handleNavigation((x, y, setFocusedPosition) => {
    if (y <= 0) {
      return;
    }

    const newPosition: Vector = [x, y - 1];
    setFocusedPosition(newPosition);
  });
};

/** Navigates the focused square down. */
export const handleMoveDown = () => {
  handleNavigation((x, y, setFocusedPosition) => {
    if (y >= BOARD_MAX_INDEX) {
      return;
    }

    const newPosition: Vector = [x, y + 1];
    setFocusedPosition(newPosition);
  });
};

/** Navigates the focused square left-up. */
export const handleMoveLeftUp = () => {
  handleNavigation((x, y, setFocusedPosition) => {
    if (x <= 0 && y <= 0) {
      return;
    }

    const newPosition: Vector = [llim(x - 1), llim(y - 1)];
    setFocusedPosition(newPosition);
  });
};

/** Navigates the focused square left-down. */
export const handleMoveLeftDown = () => {
  handleNavigation((x, y, setFocusedPosition) => {
    if (x <= 0 && y >= BOARD_MAX_INDEX) {
      return;
    }

    const newPosition: Vector = [llim(x - 1), ulim(y + 1)];
    setFocusedPosition(newPosition);
  });
};

/** Navigates the focused square right-up. */
export const handleMoveRightUp = () => {
  handleNavigation((x, y, setFocusedPosition) => {
    if (x >= BOARD_MAX_INDEX && y <= 0) {
      return;
    }

    const newPosition: Vector = [ulim(x + 1), llim(y - 1)];
    setFocusedPosition(newPosition);
  });
};

/** Navigates the focused square right-down. */
export const handleMoveRightDown = () => {
  handleNavigation((x, y, setFocusedPosition) => {
    if (x >= BOARD_MAX_INDEX && y >= BOARD_MAX_INDEX) {
      return;
    }

    const newPosition: Vector = [ulim(x + 1), ulim(y + 1)];
    setFocusedPosition(newPosition);
  });
};

export const handleSelectPromotionCandidate = (dir: 'left' | 'right') => {
  const { value: index, setState: setPromotionCandidateIndex } = useState(
    promotionCandidateIndexState
  );
  const len = 4;
  const diff = dir === 'left' ? -1 : 1;
  const newIndex = ((index + len + diff) % len) as 0 | 1 | 2 | 3;
  setPromotionCandidateIndex(newIndex);
  drawBoard();
};

let digitRegister: number = null;

export const handleDigitKeyInput = (digit: number) => {
  if (digit <= 0 || digit >= 9) {
    return;
  }

  const setFocusedPosition = useSetState(focusedPositionState);

  // When the register is empty
  if (digitRegister === null) {
    // Store the inputted digit to the register
    digitRegister = digit;
  }
  // When the register has a digit
  else {
    const file = digitRegister - 1;
    const rank = digit - 1;
    // Set selection to the specified position.
    setFocusedPosition([file, BOARD_MAX_INDEX - rank]);
    digitRegister = null;
    drawBoard();
  }
};
