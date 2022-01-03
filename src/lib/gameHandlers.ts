import { handleMovePiece } from '~/actions';
import { abbrPieceDict } from '~/game/piece';
import {
  activeBoardValue,
  boardMapValue,
  drawValue,
  isMutedValue,
  playerTurnValue,
  focusedPositionValue,
  pieceDestsValue,
  selectedPieceBoardValue,
  setPieceDests,
  setSelectedPieceBoard,
  showOppositePiecesValue,
  setIsPromoting,
  isPromotingValue,
} from '~/states';

/**
 * Play audio if it is not muted.
 * @param file File name without extension.
 */
export const snd = (file: string) => {
  const isMuted = isMutedValue();
  if (isMuted) {
    return;
  }
  new Audio(`../static/sounds/${file}.wav`).play();
};

/** Draw the game board. */
export const drawBoard = () => {
  const draw = drawValue();
  const boardMap: BoardMap = boardMapValue();
  const playerTurn: Turn = playerTurnValue();
  const playerColor: PieceColor = (['W', 'B'] as const)[playerTurn];
  const showOppositePieces = showOppositePiecesValue();
  const activeBoard = activeBoardValue();
  const focusedPosition = focusedPositionValue();
  const selectedPieceBoard = selectedPieceBoardValue();
  const dests = pieceDestsValue();
  const isPromoting = isPromotingValue();
  draw.board(boardMap, playerColor, showOppositePieces);
  if (focusedPosition !== null) {
    draw.selectedSquare(activeBoard, focusedPosition);
  }
  if (selectedPieceBoard !== null && dests.length > 0) {
    draw.dest(selectedPieceBoard, dests);
  }
  if (isPromoting) {
    // Display options of a promotion.
    draw.promotion(selectedPieceBoard, playerColor);
  }
};

/**
 * Handles operations when an area in the board has selected and returns updated arguments.
 * @param originPos The position of the piece that is selected.
 * @param destPos The destination position of the piece.
 * @param boardMap The current game board.
 * @param playerColor The color of the current player.
 * @param advanced2Pos The destination of the pawn that has moved two steps.
 * @param canCastle Lists that represent whether it is available to castle.
 * @returns `originPos`, `destPos`, `prom`
 */
export const handleBoardSelection = (
  originPos: Vector | null,
  destPos: Vector | null,
  boardMap: BoardMap,
  playerColor: PieceColor,
  advanced2Pos: number[] | null,
  canCastle: CastlingPotentials
) => {
  const sqPos = focusedPositionValue();
  const boardId = activeBoardValue();
  const isPromoting = isPromotingValue();

  // When one of the user's own pieces has selected
  if (boardMap.get(`${boardId},${String(sqPos)}`)?.[0] === playerColor) {
    originPos = sqPos;
    // Generate a class of the selected piece.
    const PieceClass = abbrPieceDict[boardMap.get(`${boardId},${String(sqPos)}`)[1] as PieceName];
    const piece = new PieceClass(playerColor, boardId);
    // The available destinations of the piece.
    const dests = piece.validMoves(originPos, boardMap, advanced2Pos, canCastle);
    setPieceDests(dests);
    setSelectedPieceBoard(boardId);
    setIsPromoting(false);
    // Redraw the board.
    drawBoard();
  }
  // When the position other than pieces has selected
  else {
    // When it is the time for promotion
    if (isPromoting) {
      const pieces: PieceName[] = ['N', 'B', 'R', 'Q'];
      for (let i = 2; i <= 5; i++) {
        if (sqPos[0] === i && (sqPos[1] === 3 || sqPos[1] === 4)) {
          snd('move');
          // Cancel displaying destinations.
          setSelectedPieceBoard(null);
          setPieceDests([]);
          // Apply the promotion to Database.
          handleMovePiece(boardId, originPos, destPos, pieces[i - 2]);
        }
      }
      // Cancel displaying options.
      setIsPromoting(false);
      originPos = null;
    }
    // When it is not the time for promotion
    // and the selected position is that some piece is present
    else if (boardMap.has(`${boardId},${String(originPos)}`)) {
      destPos = sqPos;
      // Generate a class of the selected piece.
      const PieceClass =
        abbrPieceDict[boardMap.get(`${boardId},${String(originPos)}`)[1] as PieceName];
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
