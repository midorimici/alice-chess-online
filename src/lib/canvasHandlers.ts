import { handleMovePiece } from '~/actions';
import Draw from '~/game/draw';
import Mouse from '~/game/mouse';
import { abbrPieceDict } from '~/game/piece';
import { t } from '~/i18n';
import {
  boardMapValue,
  isMutedValue,
  playerNamesValue,
  playerTurnValue,
  showOppositePiecesValue,
  userNameValue,
} from '~/states';

let draw: Draw;
let mouses: Pair<Mouse>;
/** Whether `initCanvas` has executed. */
let doneInitCanvas: boolean = false;
/** `canvas` elements */
const canvass = Array.from(document.getElementsByClassName('canvas')) as HTMLCanvasElement[];
/** A message element beside `canvas` */
const gameMessage = document.getElementById('game-message');

/**
 * Play audio if it is not muted.
 * @param file File name without extension.
 */
const snd = (file: string) => {
  const isMuted = isMutedValue();
  if (isMuted) {
    return;
  }
  new Audio(`../static/sounds/${file}.wav`).play();
};

/** Hides input forms and shows game container including canvas. */
const initCanvas = async () => {
  document.getElementById('settings').style.display = 'none';

  const gameContainer = document.getElementById('game-container');
  gameContainer.style.display = 'flex';

  const cw: number = gameContainer.clientWidth;
  const ch: number = gameContainer.clientHeight;

  if (cw < ch || ch < 720) {
    document.getElementById('logo').style.display = 'none';
    document.getElementById('info-icon').style.display = 'none';
    document.getElementsByTagName('footer')[0].style.display = 'none';
  }

  const max: number = cw < ch ? ch : cw;
  const cvsize: string = (0.4 * max).toString();
  for (const canvas of canvass) {
    canvas.setAttribute('width', cvsize);
    canvas.setAttribute('height', cvsize);
  }

  draw = await Draw.init(canvass);
  mouses = [new Mouse(canvass[0]), new Mouse(canvass[1])];
  doneInitCanvas = true;
};

export const showWaitingPlayerScreen = () => {
  if (!doneInitCanvas) initCanvas();
  gameMessage.innerText = t('waitingOpponent');
};

export const drawBoard = () => {
  const boardMap: BoardMap = boardMapValue();
  const playerTurn: Turn = playerTurnValue();
  const playerColor: PieceColor = (['W', 'B'] as const)[playerTurn];
  const showOppositePieces = showOppositePiecesValue();
  draw.board(boardMap, playerColor, showOppositePieces);
};

/**
 * Handles screen events of the player during the game.
 * @param isMyTurn Whether the current turn is the current user's.
 * @param checked Whether one of the players is checked.
 * @param advanced2Pos The destination of the pawn that has moved two steps.
 * @param canCastle Lists that represent whether it is available to castle.
 */
export const handlePlayerGameScreen = async (
  isMyTurn: boolean,
  checked: boolean,
  advanced2Pos: number[] | null,
  canCastle: CastlingPotentials
) => {
  const userName = userNameValue();
  const playerTurn = playerTurnValue();
  const playerNames = playerNamesValue();
  const boardMap = boardMapValue();
  const playerColor: PieceColor = (['W', 'B'] as const)[playerTurn];

  /** The position of the piece that is selected. */
  let originPos: Vector;
  /** The destination position of the piece. */
  let destPos: Vector;
  // Display the opponent name.
  if (document.getElementById('user-names').innerText === '') {
    const opponent = playerNames[1 - playerTurn];
    document.getElementById('user-names').innerText = `↑ ${opponent}\n↓ ${userName}`;
  }
  // Draw the game board.
  if (!doneInitCanvas) await initCanvas();
  drawBoard();
  // When it is the current user's turn
  if (isMyTurn) {
    // Show player's turn.
    gameMessage.innerText = t('isYourTurn');
    snd('move');

    // Mouse event
    for (const [index, canvas] of canvass.entries()) {
      let prom = false;
      const mouse = mouses[index];
      canvas.onclick = (e: MouseEvent) => {
        /** The square position that has clicked. */
        const sqPos = mouse.getCoord(e);
        // When one of the user's own pieces has selected
        if (boardMap.get(`${index},${String(sqPos)}`)?.[0] === playerColor) {
          originPos = sqPos;
          // Generate a class of the clicked piece.
          const PieceClass =
            abbrPieceDict[boardMap.get(`${index},${String(sqPos)}`)[1] as PieceName];
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

          // Redraw the game board.
          // drawBoard();

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
            } else {
              prom = false;
              originPos = null;
            }
          } else {
            originPos = null;
          }
        }
      };
    }
  }
  // When it is opponent's turn
  else {
    gameMessage.innerText = t('isOpponentTurn');

    for (const canvas of canvass) {
      canvas.onclick = () => {};
    }
  }

  // Display if it is checked.
  if (checked) {
    gameMessage.innerHTML = t('check') + '<br>' + gameMessage.innerText;
    snd('check');
  }
};

/**
 * Displays the game screen for audience.
 * @param turn The current turn.
 * @param checked Whether one of the players is checked.
 * @param omitMessage 🤔 手番やチェックのメッセージを省略するか
 */
export const showAudienceGameScreen = async (
  turn: Turn,
  checked: boolean,
  omitMessage: boolean = false
) => {
  const playerNames = playerNamesValue();

  // Display player names.
  if (document.getElementById('user-names').innerText === '') {
    document.getElementById('user-names').innerText = `↑ ${playerNames[1]}\n↓ ${playerNames[0]}`;
  }

  // 🚧 // Display if it is checked.
  // if (checked) {
  //   gameMessage.innerHTML = t('check') + '<br>' + gameMessage.innerText;
  // }

  // Draw the game board.
  if (!doneInitCanvas) await initCanvas();
  drawBoard();
  // 🚧 showHideButton.onclick = () => toggleShowHide(boardsMap, 'W');

  if (omitMessage) return;

  // Show player's turn.
  const curPlayer: string = playerNames[turn];
  gameMessage.innerText = t('isPlayersTurn', curPlayer);
  snd('move');

  // Display if it is checked.
  if (checked) {
    gameMessage.innerHTML = t('check') + '<br>' + gameMessage.innerText;
    snd('check');
  }
};
