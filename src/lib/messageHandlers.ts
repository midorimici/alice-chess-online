import { t } from '~/i18n';
import { roomIdValue } from '~/states';

const p: HTMLElement = document.getElementById('message');

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
