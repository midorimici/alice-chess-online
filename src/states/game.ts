import { BOARD_MAX_INDEX } from '~/config';
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
  const [x, y] = state;
  if (x < 0 || x > BOARD_MAX_INDEX || y < 0 || y > BOARD_MAX_INDEX) {
    return;
  }

  focusedPosition = state;
};

export const focusedPositionValue = () => focusedPosition;

export const useFocusedPosition = () => ({ focusedPosition, setFocusedPosition });

/** On which board the selected piece is. */
let selectedPieceBoard: BoardId = null;

export const setSelectedPieceBoard = (state: BoardId) => {
  selectedPieceBoard = state;
};

export const selectedPieceBoardValue = () => selectedPieceBoard;

export const useSelectedPieceBoard = () => ({ selectedPieceBoard, setSelectedPieceBoard });

/** Available destination positions of the selected piece. */
let pieceDests: Vector[] = [];

export const setPieceDests = (state: Vector[]) => {
  pieceDests = state;
};

export const pieceDestsValue = () => pieceDests;

/** Whether the dialog to promote is showing up. */
let isPromoting: boolean = false;

export const setIsPromoting = (state: boolean) => {
  isPromoting = state;
};

export const isPromotingValue = () => isPromoting;
