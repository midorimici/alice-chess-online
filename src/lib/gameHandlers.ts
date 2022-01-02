import { handleMovePiece } from '~/actions';
import { abbrPieceDict } from '~/game/piece';
import {
  boardMapValue,
  drawValue,
  isMutedValue,
  playerTurnValue,
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
  draw.board(boardMap, playerColor, showOppositePieces);
};

/**
 * Handles operations when an area in the board has selected and returns updated arguments.
 * @param originPos The position of the piece that is selected.
 * @param destPos The destination position of the piece.
 * @param prom Whether it is available to promote.
 * @param sqPos The square position that has clicked.
 * @param index The board id.
 * @param boardMap The current game board.
 * @param playerColor The color of the current player.
 * @param advanced2Pos The destination of the pawn that has moved two steps.
 * @param canCastle Lists that represent whether it is available to castle.
 * @returns `originPos`, `destPos`, `prom`
 */
export const handleBoardSelection = (
  originPos: Vector,
  destPos: Vector,
  prom: boolean,
  sqPos: Vector,
  index: 0 | 1,
  boardMap: BoardMap,
  playerColor: PieceColor,
  advanced2Pos: number[] | null,
  canCastle: CastlingPotentials
) => {
  const draw = drawValue();

  // When one of the user's own pieces has clicked
  if (boardMap.get(`${index},${String(sqPos)}`)?.[0] === playerColor) {
    originPos = sqPos;
    // Generate a class of the clicked piece.
    const PieceClass = abbrPieceDict[boardMap.get(`${index},${String(sqPos)}`)[1] as PieceName];
    const piece = new PieceClass(playerColor, index as 0 | 1);
    // Draw the destination positions.
    drawBoard();
    draw.dest(piece, originPos, boardMap, advanced2Pos, canCastle);
    prom = false;
  }
  // When the position other than pieces has clicked
  else {
    // When it is not the time for promotion
    // and the selected position is that some piece is present
    if (!prom && boardMap.has(`${index},${String(originPos)}`)) {
      destPos = sqPos;
      // Generate a class of the selected piece.
      const PieceClass =
        abbrPieceDict[boardMap.get(`${index},${String(originPos)}`)[1] as PieceName];
      const piece = new PieceClass(playerColor, index as 0 | 1);
      // When the destination position is clicked
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
          handleMovePiece(index as 0 | 1, originPos, destPos);
        }
      }
    }

    // Redraw the game board to show a removal of a selection.
    drawBoard();

    // When it is the time for promotion
    if (prom) {
      const pieces: PieceName[] = ['N', 'B', 'R', 'Q'];
      for (let i = 2; i <= 5; i++) {
        if (sqPos[0] === i && (sqPos[1] === 3 || sqPos[1] === 4)) {
          prom = false;
          snd('move');
          // Apply the promotion to Database.
          handleMovePiece(index as 0 | 1, originPos, destPos, pieces[i - 2]);
        }
      }
      // When it is right after the selection of the destination
      if (String(sqPos) === String(destPos)) {
        // Display options of a promotion.
        draw.promotion(index as 0 | 1, playerColor);
      }
      // When the other area is clicked
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
