import { handleMovePiece } from '~/actions';
import { BOARD_MAX_INDEX } from '~/config';
import { rotateBoard } from '~/game/game';
import { abbrPieceDict } from '~/game/piece';
import {
  playerTurnState,
  isMutedState,
  showOppositePiecesState,
  drawState,
  boardMapState,
  activeBoardState,
  focusedPositionState,
  selectedPieceBoardState,
  selectedPieceColorState,
  pieceDestsState,
  isPromotingState,
  promotionCandidateIndexState,
  lastMovedPiecePositionState,
  digitRegisterState,
} from '~/states';
import { easyMotionWaitingState } from '~/states/game';
import { useSetState, useState, useValue } from '~/states/stateManager';

/**
 * Play audio if it is not muted.
 * @param file File name without extension.
 */
export const snd = (file: string) => {
  const isMuted = useValue(isMutedState);
  if (isMuted) {
    return;
  }
  new Audio(`../static/sounds/${file}.wav`).play();
};

/** Draw the game board. */
export const drawBoard = () => {
  const draw = useValue(drawState);
  const boardMap: BoardMap = useValue(boardMapState);
  const playerTurn: Turn = useValue(playerTurnState);
  const playerColor: PieceColor = (['W', 'B'] as const)[playerTurn];
  const showOppositePieces = useValue(showOppositePiecesState);
  const activeBoard = useValue(activeBoardState);
  const focusedPosition = useValue(focusedPositionState);
  const selectedPieceBoard = useValue(selectedPieceBoardState);
  const selectedPieceColor = useValue(selectedPieceColorState);
  const dests = useValue(pieceDestsState);
  const isPromoting = useValue(isPromotingState);
  const promotionCandidateIndex = useValue(promotionCandidateIndexState);
  const digitRegister = useValue(digitRegisterState);
  const easyMotionWaiting = useValue(easyMotionWaitingState);
  draw.board(boardMap, playerColor, showOppositePieces);
  if (isPromoting) {
    // Display options of a promotion.
    draw.promotion(selectedPieceBoard, playerColor);
    draw.selectedPromotionCandidate(selectedPieceBoard, promotionCandidateIndex);
  } else {
    if (focusedPosition !== null) {
      draw.selectedSquare(activeBoard, focusedPosition);
    }
    if (selectedPieceBoard !== null && dests.length > 0) {
      draw.dest(selectedPieceBoard, dests, selectedPieceColor === playerColor);
    }
    if (digitRegister !== null) {
      draw.selectedFile(activeBoard, digitRegister - 1);
    }
    if (easyMotionWaiting) {
      draw.labelsOverPieces(boardMap);
    }
  }
};

/**
 * Promotes the pawn.
 * @param originPos The original position of the pawn.
 * @param destPos The destination position of the pawn.
 * @param piece The piece which the pawn promotes to.
 */
export const promote = (originPos: Vector, destPos: Vector, piece: PieceName) => {
  const boardId = useValue(activeBoardState);
  const setLastMovedPiecePosition = useSetState(lastMovedPiecePositionState);
  const setSelectedPieceBoard = useSetState(selectedPieceBoardState);
  const setPieceDests = useSetState(pieceDestsState);
  snd('move');
  // Apply the promotion to Database.
  handleMovePiece(boardId, originPos, destPos, piece);
  // Save the latest position.
  setLastMovedPiecePosition({
    board: (1 - boardId) as BoardId,
    x: destPos[0],
    y: destPos[1],
  });
  // Cancel displaying destinations.
  setSelectedPieceBoard(null);
  setPieceDests([]);
};

/**
 * Handles operations when an area in the board has selected and returns updated arguments.
 * @param originPos The position of the piece that is selected.
 * @param destPos The destination position of the piece.
 * @param boardMap The current game board.
 * @param playerColor The color of the current player.
 * @param advanced2Pos The destination of the pawn that has moved two steps.
 * @param canCastle Lists that represent whether it is available to castle.
 * @returns `originPos`, `destPos`
 */
export const handleBoardSelection = (
  originPos: Vector | null,
  destPos: Vector | null,
  boardMap: BoardMap,
  playerColor: PieceColor,
  advanced2Pos: number[] | null,
  canCastle: CastlingPotentials
): { originPos: Vector | null; destPos: Vector | null } => {
  const sqPos = useValue(focusedPositionState);
  const boardId = useValue(activeBoardState);
  const { value: isPromoting, setState: setIsPromoting } = useState(isPromotingState);
  const { value: pieceDests, setState: setPieceDests } = useState(pieceDestsState);
  const setSelectedPieceBoard = useSetState(selectedPieceBoardState);
  const { value: selectedPieceColor, setState: setSelectedPieceColor } =
    useState(selectedPieceColorState);
  const setLastMovedPiecePosition = useSetState(lastMovedPiecePositionState);

  const selectedPiece = boardMap.get(`${boardId},${String(sqPos)}`);
  // When one of the pieces has selected
  // and that position is not that the current player's selected piece is about to move to.
  if (
    selectedPiece &&
    !(
      pieceDests.some((dest: Vector) => dest[0] === sqPos[0] && dest[1] === sqPos[1]) &&
      selectedPieceColor === playerColor
    )
  ) {
    originPos = sqPos;
    // Generate a class of the selected piece.
    const pieceColor: PieceColor = selectedPiece[0] as PieceColor;
    const PieceClass = abbrPieceDict[selectedPiece[1] as PieceName];
    const piece = new PieceClass(pieceColor, boardId);
    // The available destinations of the piece.
    let dests: Vector[];
    // When the selected piece is current player's
    if (pieceColor === playerColor) {
      dests = piece.validMoves(originPos, boardMap, advanced2Pos, canCastle);
    }
    // When the selected piece is opponent's
    else {
      const pos: Vector = [BOARD_MAX_INDEX - originPos[0], BOARD_MAX_INDEX - originPos[1]];
      const board: BoardMap = rotateBoard(boardMap);
      dests = piece
        .validMoves(pos, board, advanced2Pos, canCastle)
        .map((position: Vector) => [BOARD_MAX_INDEX - position[0], BOARD_MAX_INDEX - position[1]]);
    }
    setPieceDests(dests);
    setSelectedPieceBoard(boardId);
    setSelectedPieceColor(pieceColor);
    setIsPromoting(false);
    // Redraw the board.
    drawBoard();
  }
  // When the position other than pieces has selected
  else {
    const originPosPiece = boardMap.get(`${boardId},${String(originPos)}`);
    // When it is the time for promotion
    if (isPromoting) {
      const pieces: PieceName[] = ['N', 'B', 'R', 'Q'];
      for (let i = 2; i <= 5; i++) {
        if (sqPos[0] === i && (sqPos[1] === 3 || sqPos[1] === 4)) {
          promote(originPos, destPos, pieces[i - 2]);
        }
      }
      // Cancel displaying options.
      setIsPromoting(false);
      originPos = null;
    }
    // When it is not the time for promotion
    // and the selected position is that some piece of the current player is present
    else if (originPosPiece && originPosPiece[0] === playerColor) {
      destPos = sqPos;
      // Generate a class of the selected piece.
      const PieceClass = abbrPieceDict[originPosPiece[1] as PieceName];
      const piece = new PieceClass(playerColor, boardId);
      // When the destination position is selected
      if (
        piece
          .validMoves(originPos, boardMap, advanced2Pos, canCastle)
          .some((e) => String(e) === String(destPos))
      ) {
        // When the selected piece is pawn and it is at the last rank
        if (piece.abbr === 'P' && destPos[1] === 0) {
          // It should be a move for promotion.
          setIsPromoting(true);
          setPieceDests([]);
        } else {
          snd('move');
          // Move the piece and apply that move to Database.
          handleMovePiece(boardId, originPos, destPos);
          // Save the latest position.
          setLastMovedPiecePosition({
            board: (1 - boardId) as BoardId,
            x: destPos[0],
            y: destPos[1],
          });
          // Cancel selection.
          setSelectedPieceBoard(null);
          setPieceDests([]);
          originPos = null;
        }
      }
    }

    // Redraw the game board.
    drawBoard();
  }

  return { originPos, destPos };
};
