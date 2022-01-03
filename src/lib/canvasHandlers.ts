import Draw from '~/game/draw';
import Mouse from '~/game/mouse';
import { t } from '~/i18n';
import {
  boardMapValue,
  playerNamesValue,
  playerTurnValue,
  setActiveBoard,
  setDraw,
  setFocusedPosition,
  setIsPromoting,
  userNameValue,
} from '~/states';
import { drawBoard, handleBoardSelection, snd } from './gameHandlers';
import { setGameKeyboardShortcut } from './keyboardShortcutHandlers';

let mouses: Pair<Mouse>;
/** Whether `initCanvas` has executed. */
let doneInitCanvas: boolean = false;
/** `canvas` elements */
const canvass = Array.from(document.getElementsByClassName('canvas')) as HTMLCanvasElement[];
/** A message element beside `canvas` */
const gameMessage = document.getElementById('game-message');

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

  setDraw(await Draw.init(canvass));
  mouses = [new Mouse(canvass[0]), new Mouse(canvass[1])];
  doneInitCanvas = true;
};

export const showWaitingPlayerScreen = () => {
  if (!doneInitCanvas) initCanvas();
  gameMessage.innerText = t('waitingOpponent');
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
  let originPos: Vector = null;
  /** The destination position of the piece. */
  let destPos: Vector = null;
  // Display the opponent name.
  if (document.getElementById('user-names').innerText === '') {
    const opponent = playerNames[1 - playerTurn];
    document.getElementById('user-names').innerText = `↑ ${opponent}\n↓ ${userName}`;
  }
  // Draw the game board.
  if (!doneInitCanvas) await initCanvas();
  // When it is the current user's turn
  if (isMyTurn) {
    // Show player's turn.
    gameMessage.innerText = t('isYourTurn');
    snd('move');

    // Draw board.
    drawBoard();

    // Mouse event
    for (const [index, canvas] of canvass.entries()) {
      const mouse = mouses[index];
      canvas.onclick = (e: MouseEvent) => {
        /** The square position that has clicked. */
        const sqPos = mouse.getCoord(e);
        setActiveBoard(index as BoardId);
        setFocusedPosition(sqPos);
        ({ originPos, destPos } = handleBoardSelection(
          originPos,
          destPos,
          boardMap,
          playerColor,
          advanced2Pos,
          canCastle
        ));
      };
    }

    // Keyboard event
    document.onkeydown = (e: KeyboardEvent) => {
      const code = e.code;
      const res = setGameKeyboardShortcut(
        code,
        originPos,
        destPos,
        boardMap,
        playerColor,
        advanced2Pos,
        canCastle
      );
      if (res !== undefined) {
        ({ originPos, destPos } = res);
      }
    };
  }
  // When it is opponent's turn
  else {
    // Show player's turn.
    gameMessage.innerText = t('isOpponentTurn');

    // Draw board.
    setFocusedPosition(null);
    drawBoard();

    // Cancel event listeners.
    for (const canvas of canvass) {
      canvas.onclick = () => {};
    }

    document.onkeydown = () => {};
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
 * @param omitMessage Whether to omit displaying messages.
 *        It should be `true` when audience enter a room after a game is over
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

  // Draw the game board.
  if (!doneInitCanvas) await initCanvas();
  drawBoard();

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
