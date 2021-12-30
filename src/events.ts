import { t } from './i18n';
import { useMuted, useShowOppositePieces } from './states';

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
      const info = {
        private: data.get('visibility') === 'private',
        roomId: data.get('room') as string,
        role: data.get('role') as 'play' | 'watch',
        name: data.get('username') === '' ? t('anonymous') : (data.get('username') as string),
      };
      // myrole = info.role;
      // myname = info.name;
      // socket.emit('enter room', info);
    },
    false
  );
};

export const addMuteButtonClickEventListener = () => {
  const muteButton = document.getElementById('mute-icon') as HTMLImageElement;
  const { muted, toggleMuted } = useMuted();
  muteButton.onclick = () => {
    muteButton.src = muted
      ? '../static/svg/volume-up-solid.svg'
      : '../static/svg/volume-mute-solid.svg';
    muteButton.title = muted ? t('mute') : t('unmute');
    toggleMuted();
  };
};

/**
 * 駒表示ボタン
 * @param boardsMap 盤面
 * @param color 自分の色
 */
export const addShowHideButtonClickEventListener = () =>
  // boardsMap: Map<string, string>,
  // color: 'W' | 'B'
  {
    const showHideButton = document.getElementById('eye-icon') as HTMLImageElement;
    const { showOppositePieces, toggleShowOppositePieces } = useShowOppositePieces();
    showHideButton.src = showOppositePieces
      ? '../static/svg/eye-slash-regular.svg'
      : '../static/svg/eye-regular.svg';
    showHideButton.title = showOppositePieces ? t('showOppositePieces') : t('hideOppositePieces');
    toggleShowOppositePieces();
    // draw.board(boardsMap, color, showOppositePieces);
  };
