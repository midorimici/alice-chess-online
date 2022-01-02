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

/** The selecting square position. */
let selectingPosition: Vector = null;

export const setSelectingPosition = (state: Vector) => {
  selectingPosition = state;
};

export const selectingPositionValue = () => selectingPosition;

/** The active board in the two. */
let activeBoard: BoardId = 0;

export const setActiveBoard = (state: BoardId) => {
  activeBoard = state;
};

export const switchActiveBoard = () => {
  activeBoard = (1 - activeBoard) as BoardId;
};

export const activeBoardValue = () => activeBoard;
