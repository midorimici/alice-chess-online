import { boardMapValue, setActiveBoard, switchActiveBoard, useFocusedPosition } from '~/states';
import { drawBoard } from './gameHandlers';

const BOARD_MAX_INDEX = 7;

const ulim = (val: number) => Math.min(val, BOARD_MAX_INDEX);

const llim = (val: number) => Math.max(val, 0);

/**
 * Returns a position of the previously moved piece.
 * @returns `board`: A board id.
 *          `x`, `y`: A position.
 */
const previouslyMovedPiecePosition = (): { board: BoardId; x: number; y: number } => {
  const boardMap = boardMapValue();
  const lastPosition = Array.from(boardMap.keys()).slice(-1)[0];
  const [board, x, y] = lastPosition.split(',').map((str) => +str);
  return { board: board as BoardId, x, y };
};

const handleNavigation = (
  action: (x: number, y: number, setFocusedPosition: (state: Vector) => void) => void
) => {
  const { focusedPosition, setFocusedPosition } = useFocusedPosition();
  if (focusedPosition === null) {
    const { board, x, y } = previouslyMovedPiecePosition();
    setActiveBoard(board);
    setFocusedPosition([x, y]);
  } else {
    action(...focusedPosition, setFocusedPosition);
  }
  drawBoard();
};

/** Moves the focused square to the opposite board. */
export const handleSwitchActiveBoard = () => {
  handleNavigation(() => switchActiveBoard());
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
