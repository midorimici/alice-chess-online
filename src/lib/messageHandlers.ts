import { t } from '~/i18n';
import { playerNamesState, roomIdState } from '~/states';
import { useValue } from '~/states/stateManager';
import { snd } from './gameHandlers';

const p: HTMLElement = document.getElementById('message');
const gameMessage = document.getElementById('game-message');

/** Show message that tells the user that the room is full and does not receive new players. */
export const showRoomFullMessage = () => {
  const roomId = useValue(roomIdState);
  p.innerText = t('roomIsFull', roomId);
};

/** Show message that tells the audience that the room specified is empty. */
export const showPrivateRoomEmptyMessage = () => {
  const roomId = useValue(roomIdState);
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
    const players = useValue(playerNamesState);
    gameMessage.innerHTML = t('checkmate') + '<br>' + t('winner', players[winner]);
  }
  snd('win');
};

/**
 * Add a new message to the chat list.
 * @param message A chat message data that will be added to the chat list.
 */
export const addChatMessage = (message: ChatMessage) => {
  const ul = document.getElementById('chat-messages');
  const item = document.createElement('li');
  const chat = document.getElementById('chat');
  const chatCircle = document.getElementById('chat-new');
  const nameSpan = document.createElement('span');
  nameSpan.className = 'chat-name';
  nameSpan.innerText = message.name;

  if (message.isPlayer) {
    const icon = document.createElement('img');
    icon.className = 'chat-player-icon';
    icon.src = '../static/svg/ghost-solid.svg';
    icon.alt = 'player-icon';
    icon.title = t('player');
    nameSpan.appendChild(icon);
  }

  item.appendChild(nameSpan);

  const msgSpan = document.createElement('span');
  msgSpan.innerText = message.message;
  item.appendChild(msgSpan);

  ul.appendChild(item);
  ul.scrollTop = ul.scrollHeight;

  if (chat.className === 'closed') chatCircle.className = '';
};
