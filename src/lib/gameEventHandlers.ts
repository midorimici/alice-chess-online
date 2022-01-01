import { t } from '~/i18n';
import { useIsMuted } from '~/states';

const muteButton = document.getElementById('mute-icon') as HTMLImageElement;

export const handleToggleMute = () => {
  const { isMuted, toggleIsMuted } = useIsMuted();
  muteButton.src = isMuted
    ? '../static/svg/volume-up-solid.svg'
    : '../static/svg/volume-mute-solid.svg';
  muteButton.title = isMuted ? t('mute') : t('unmute');
  toggleIsMuted();
};
