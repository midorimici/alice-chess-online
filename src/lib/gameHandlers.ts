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
  draw.board(boardMap, playerColor, showOppositePieces);
  if (focusedPosition !== null) {
    draw.selectedSquare(activeBoard, focusedPosition);
  }
  if (selectedPieceBoard !== null && dests.length > 0) {
    draw.dest(selectedPieceBoard, dests);
  }
};

/**
 * Handles operations when an area in the board has selected and returns updated arguments.
 * @param originPos The position of the piece that is selected.
 * @param destPos The destination position of the piece.
 * @param prom Whether it is available to promote.
 * @param boardMap The current game board.
 * @param playerColor The color of the current player.
 * @param advanced2Pos The destination of the pawn that has moved two steps.
 * @param canCastle Lists that represent whether it is available to castle.
 * @returns `originPos`, `destPos`, `prom`
 */
export const handleBoardSelection = (
  originPos: Vector | null,
  destPos: Vector | null,
  prom: boolean,
  boardMap: BoardMap,
  playerColor: PieceColor,
  advanced2Pos: number[] | null,
  canCastle: CastlingPotentials
) => {
  const draw = drawValue();
  const sqPos = focusedPositionValue();
  const boardId = activeBoardValue();

  // When one of the user's own pieces has selected
  if (boardMap.get(`${boardId},${String(sqPos)}`)?.[0] === playerColor) {
    originPos = sqPos;
    // Generate a class of the selected piece.
    const PieceClass = abbrPieceDict[boardMap.get(`${boardId},${String(sqPos)}`)[1] as PieceName];
    const piece = new PieceClass(playerColor, boardId);
    const dests = piece.validMoves(originPos, boardMap, advanced2Pos, canCastle);
    setPieceDests(dests);
    setSelectedPieceBoard(boardId);
    // Draw the destination positions.
    drawBoard();
    prom = false;
  }
  // When the position other than pieces has selected
  else {
    // When it is not the time for promotion
    // and the selected position is that some piece is present
    if (!prom && boardMap.has(`${boardId},${String(originPos)}`)) {
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
        // When the clicked piece is pawn and it is at the last rank
        if (piece.abbr === 'P' && destPos[1] === 0) {
          // It should be a move for promotion.
          prom = true;
        } else {
          snd('move');
          // Move the piece and apply that move to Database.
          handleMovePiece(boardId, originPos, destPos);
        }
      }
    }

    // Redraw the game board to remove destination options.
    setSelectedPieceBoard(null);
    setPieceDests([]);
    drawBoard();

    // When it is the time for promotion
    if (prom) {
      const pieces: PieceName[] = ['N', 'B', 'R', 'Q'];
      for (let i = 2; i <= 5; i++) {
        if (sqPos[0] === i && (sqPos[1] === 3 || sqPos[1] === 4)) {
          prom = false;
          snd('move');
          // Apply the promotion to Database.
          handleMovePiece(boardId, originPos, destPos, pieces[i - 2]);
        }
      }
      // When it is right after the selection of the destination
      if (String(sqPos) === String(destPos)) {
        // Display options of a promotion.
        draw.promotion(boardId, playerColor);
      }
      // When the other area is selected
      else {
        // Cancel displaying options.
        prom = false;
        originPos = null;
      }
    } else {
      originPos = null;
    }
  }

  return { originPos, destPos, prom };
};
