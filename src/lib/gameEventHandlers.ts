import { t } from '~/i18n';
import { useIsMuted, useShowOppositePieces } from '~/states';
import { drawBoard } from './canvasHandlers';

const muteButton = document.getElementById('mute-icon') as HTMLImageElement;

export const handleToggleMute = () => {
  const { isMuted, toggleIsMuted } = useIsMuted();
  muteButton.src = isMuted
    ? '../static/svg/volume-up-solid.svg'
    : '../static/svg/volume-mute-solid.svg';
  muteButton.title = isMuted ? t('mute') : t('unmute');
  toggleIsMuted();
};

const showHideButton = document.getElementById('eye-icon') as HTMLImageElement;

export const handleShowHide = () => {
  const { showOppositePieces, toggleShowOppositePieces } = useShowOppositePieces();
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
