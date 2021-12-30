import { handleEnterRoom } from './actions';
import { t } from './i18n';
import { drawBoard } from './lib/canvasHandlers';
import { setUserName, setUserRole, useIsMuted, useShowOppositePieces } from './states';

export const addInfoButtonClickEventListener = () => {
  const infoBtn = document.getElementById('info-icon');
  infoBtn.onclick = () => {
    document.getElementById('info-overlay').style.display = 'flex';
  };

  const infoCloseBtn = document.getElementById('close-icon');
  infoCloseBtn.onclick = () => {
    document.getElementById('info-overlay').style.display = 'none';
  };
};

/**
 * Listens events to set room visibility.
 * If the visibility is public, hide the input field of room key and remove its `required` property .
 */
export const addVisibilityButtonsClickEventListener = () => {
  const visibilityBtns = document.getElementsByName('visibility');
  let roomKey = document.getElementById('room-key');
  let roomKeyInput = document.getElementById('room-input') as HTMLInputElement;
  if ((visibilityBtns[0] as HTMLInputElement).checked) {
    roomKey.style.visibility = 'hidden';
    roomKeyInput.required = false;
  }
  for (let i = 0; i <= 1; i++) {
    visibilityBtns[i].onclick = () => {
      roomKey.style.visibility = i === 0 ? 'hidden' : 'visible';
      roomKeyInput.required = i === 1;
    };
  }
};

export const addFormEventListener = () => {
  const form = document.getElementById('form') as HTMLFormElement;
  form.addEventListener(
    'submit',
    (e: Event) => {
      e.preventDefault();
      const data = new FormData(form);
      const role: Role = data.get('role') as Role;
      const userName = data.get('username') as string;
      const name = userName === '' ? t('anonymous') : userName;
      const info = {
        private: data.get('visibility') === 'private',
        roomId: data.get('room') as string,
        role,
        name,
      };
      setUserRole(role);
      setUserName(name);
      handleEnterRoom(info);
    },
    false
  );
};

export const addMuteButtonClickEventListener = () => {
  const muteButton = document.getElementById('mute-icon') as HTMLImageElement;
  muteButton.onclick = () => {
    const { isMuted, toggleIsMuted } = useIsMuted();
    muteButton.src = isMuted
      ? '../static/svg/volume-up-solid.svg'
      : '../static/svg/volume-mute-solid.svg';
    muteButton.title = isMuted ? t('mute') : t('unmute');
    toggleIsMuted();
  };
};

export const addShowHideButtonClickEventListener = () => {
  const showHideButton = document.getElementById('eye-icon') as HTMLImageElement;
  showHideButton.onclick = () => {
    const { showOppositePieces, toggleShowOppositePieces } = useShowOppositePieces();
    showHideButton.src = showOppositePieces
      ? '../static/svg/eye-slash-regular.svg'
      : '../static/svg/eye-regular.svg';
    showHideButton.title = showOppositePieces ? t('showOppositePieces') : t('hideOppositePieces');
    toggleShowOppositePieces();
    drawBoard();
  };
};
