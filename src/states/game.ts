import Draw from '~/game/draw';

/** `Draw` instance. */
let draw: Draw;

export const drawValue = () => draw;

export const setDraw = (state: Draw) => {
  draw = state;
};

/** A `Map` object that represents game board seen from the current user. */
let boardMap: BoardMap = new Map();

export const setBoardMap = (state: BoardMap) => {
  boardMap = state;
};

export const boardMapValue = () => boardMap;

/** The active board in the two. */
let activeBoard: BoardId = 0;

export const setActiveBoard = (state: BoardId) => {
  activeBoard = state;
};

export const switchActiveBoard = () => {
  activeBoard = (1 - activeBoard) as BoardId;
};

export const activeBoardValue = () => activeBoard;

/** The focused square position. */
let focusedPosition: Vector = null;

export const setFocusedPosition = (state: Vector) => {
  focusedPosition = state;
};

export const focusedPositionValue = () => focusedPosition;

export const useFocusedPosition = () => ({ focusedPosition, setFocusedPosition });
