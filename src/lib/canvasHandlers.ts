import Draw from '~/game/draw';
import { t } from '~/i18n';

let draw: Draw;
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

  draw = await Draw.init(canvass);
  doneInitCanvas = true;
};

export const showWaitingPlayerScreen = () => {
  if (!doneInitCanvas) initCanvas();
  gameMessage.innerText = t('waitingOpponent');
};
