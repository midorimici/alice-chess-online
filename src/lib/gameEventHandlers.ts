import { t } from '~/i18n';
import { isMutedState, showOppositePiecesState } from '~/states';
import { useState } from '~/states/stateManager';
import { drawBoard } from './gameHandlers';

const muteButton = document.getElementById('mute-icon') as HTMLImageElement;

export const handleToggleMute = () => {
  const { value: isMuted, toggleState: toggleIsMuted } = useState(isMutedState);
  muteButton.src = isMuted
    ? '../static/svg/volume-up-solid.svg'
    : '../static/svg/volume-mute-solid.svg';
  muteButton.title = isMuted ? t('mute') : t('unmute');
  toggleIsMuted();
};

const showHideButton = document.getElementById('eye-icon') as HTMLImageElement;

export const handleShowHide = () => {
  const { value: showOppositePieces, toggleState: toggleShowOppositePieces } =
    useState(showOppositePiecesState);
  showHideButton.src = showOppositePieces
    ? '../static/svg/eye-slash-regular.svg'
    : '../static/svg/eye-regular.svg';
  showHideButton.title = showOppositePieces ? t('showOppositePieces') : t('hideOppositePieces');
  toggleShowOppositePieces();
  drawBoard();
};

const chat = document.getElementById('chat');
const chatCircle = document.getElementById('chat-new');
const chatInput = document.getElementById('chat-input') as HTMLInputElement;
let timeoutId: NodeJS.Timeout;

export const handleToggleChatList = () => {
  chatCircle.className = 'hidden';
  chat.classList.toggle('closed');
  // When the list is opened
  if (chat.classList.value === '') {
    // Focus to the input after the slide in animation.
    timeoutId = setTimeout(() => chatInput.focus({ preventScroll: true }), 400);
  } else {
    clearTimeout(timeoutId);
  }
};

export const handleHideChatList = () => {
  chatInput.blur();
  if (chat.classList.value === '') {
    chat.classList.add('closed');
  }
};
