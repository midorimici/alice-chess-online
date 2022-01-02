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
