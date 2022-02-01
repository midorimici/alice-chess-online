import { BOARD_MAX_INDEX } from '~/config';
import Draw from '~/game/draw';
import { s } from './stateManager';

/** `Draw` instance. */
export const drawState = s<Draw>();

/** A `Map` object that represents game board seen from the current user. */
export const boardMapState = s<BoardMap>(new Map());

/** The active board in the two. */
export const activeBoardState = s<BoardId>(0);

/** The focused square position. */
export const focusedPositionState = s<Vector>(null, (state) => {
  if (state !== null) {
    const [x, y] = state;
    return x < 0 || x > BOARD_MAX_INDEX || y < 0 || y > BOARD_MAX_INDEX;
  }
});

/** On which board the selected piece is. */
export const selectedPieceBoardState = s<BoardId>();

/** The color of the selected piece. */
export const selectedPieceColorState = s<PieceColor>();

/** Available destination positions of the selected piece. */
export const pieceDestsState = s<Vector[]>([]);

/** The piece position that has moved the last. */
export const lastMovedPiecePositionState = s<{ board: BoardId; x: number; y: number }>();

/** Whether the dialog to promote is showing up. */
export const isPromotingState = s<boolean>(false);

/** The piece index which the pawn promotes to. */
export const promotionCandidateIndexState = s<0 | 1 | 2 | 3>(3);

/** The digit key that has inputted. */
export const digitRegisterState = s<number>(
  null,
  (state) => state !== null && (!Number.isInteger(state) || state <= 0 || state >= 9)
);

/** Whether the easy motion mode has started and waiting for next command. */
export const easyMotionWaitingState = s<boolean>(false);
