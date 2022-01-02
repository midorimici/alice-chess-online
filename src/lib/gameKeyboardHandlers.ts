import { switchActiveBoard, useFocusedPosition } from '~/states';
import { drawBoard } from './gameHandlers';

const BOARD_MAX_INDEX = 7;

const ulim = (val: number) => Math.min(val, BOARD_MAX_INDEX);

const llim = (val: number) => Math.max(val, 0);

/** Move the focused square to the opposite board. */
export const handleSwitchActiveBoard = () => {
  switchActiveBoard();
  drawBoard();
};

/** Navigate the focused square left. */
export const handleMoveLeft = () => {
  const { focusedPosition, setFocusedPosition } = useFocusedPosition();
  const [x, y] = focusedPosition;
  if (x <= 0) {
    return;
  }

  const newPosition: Vector = [x - 1, y];
  setFocusedPosition(newPosition);
  drawBoard();
};

/** Navigate the focused square right. */
export const handleMoveRight = () => {
  const { focusedPosition, setFocusedPosition } = useFocusedPosition();
  const [x, y] = focusedPosition;
  if (x >= BOARD_MAX_INDEX) {
    return;
  }

  const newPosition: Vector = [x + 1, y];
  setFocusedPosition(newPosition);
  drawBoard();
};

/** Navigate the focused square up. */
export const handleMoveUp = () => {
  const { focusedPosition, setFocusedPosition } = useFocusedPosition();
  const [x, y] = focusedPosition;
  if (y <= 0) {
    return;
  }

  const newPosition: Vector = [x, y - 1];
  setFocusedPosition(newPosition);
  drawBoard();
};

/** Navigate the focused square down. */
export const handleMoveDown = () => {
  const { focusedPosition, setFocusedPosition } = useFocusedPosition();
  const [x, y] = focusedPosition;
  if (y >= BOARD_MAX_INDEX) {
    return;
  }

  const newPosition: Vector = [x, y + 1];
  setFocusedPosition(newPosition);
  drawBoard();
};

/** Navigate the focused square left-up. */
export const handleMoveLeftUp = () => {
  const { focusedPosition, setFocusedPosition } = useFocusedPosition();
  const [x, y] = focusedPosition;
  if (x <= 0 && y <= 0) {
    return;
  }

  const newPosition: Vector = [llim(x - 1), llim(y - 1)];
  setFocusedPosition(newPosition);
  drawBoard();
};

/** Navigate the focused square left-down. */
export const handleMoveLeftDown = () => {
  const { focusedPosition, setFocusedPosition } = useFocusedPosition();
  const [x, y] = focusedPosition;
  if (x <= 0 && y >= BOARD_MAX_INDEX) {
    return;
  }

  const newPosition: Vector = [llim(x - 1), ulim(y + 1)];
  setFocusedPosition(newPosition);
  drawBoard();
};

/** Navigate the focused square right-up. */
export const handleMoveRightUp = () => {
  const { focusedPosition, setFocusedPosition } = useFocusedPosition();
  const [x, y] = focusedPosition;
  if (x >= BOARD_MAX_INDEX && y <= 0) {
    return;
  }

  const newPosition: Vector = [ulim(x + 1), llim(y - 1)];
  setFocusedPosition(newPosition);
  drawBoard();
};

/** Navigate the focused square right-down. */
export const handleMoveRightDown = () => {
  const { focusedPosition, setFocusedPosition } = useFocusedPosition();
  const [x, y] = focusedPosition;
  if (x >= BOARD_MAX_INDEX && y >= BOARD_MAX_INDEX) {
    return;
  }

  const newPosition: Vector = [ulim(x + 1), ulim(y + 1)];
  setFocusedPosition(newPosition);
  drawBoard();
};
