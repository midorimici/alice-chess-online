import { t } from '~/i18n';
import { playerNamesValue, roomIdValue } from '~/states';
import { snd } from './canvasHandlers';

const p: HTMLElement = document.getElementById('message');
const gameMessage = document.getElementById('game-message');

/** Show message that tells the user that the room is full and does not receive new players. */
export const showRoomFullMessage = () => {
  const roomId = roomIdValue();
  p.innerText = t('roomIsFull', roomId);
};

/** Show message that tells the audience that the room specified is empty. */
export const showPrivateRoomEmptyMessage = () => {
  const roomId = roomIdValue();
  p.innerText = t('roomIsEmpty', roomId);
};

/** Show message that tells the audience that no public room is available. */
export const showPublicRoomEmptyMessage = () => {
  p.innerText = t('publicRoomIsEmpty');
};

/**
 * Show the number of audience in the room.
 * @param num The number of audience in the room.
 */
export const showAudienceNumber = (num: number) => {
  document.getElementById('watcher-number').innerText = String(num);
};

/** Displays the result of the game.
 * @param winner The id of the winner. It is `2` when it is draw.
 */
export const showResult = (winner: Winner) => {
  if (winner === 2) {
    gameMessage.innerText = t('draw');
  } else {
    const players = playerNamesValue();
    gameMessage.innerHTML = t('checkmate') + '<br>' + t('winner', players[winner]);
  }
  snd('win');
};
