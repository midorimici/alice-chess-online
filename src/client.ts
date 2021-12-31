import { addChatEventListener } from './chat';
import {
  addFormEventListener,
  addInfoButtonClickEventListener,
  addMuteButtonClickEventListener,
  addShowHideButtonClickEventListener,
  addVisibilityButtonsClickEventListener,
} from './events';

addInfoButtonClickEventListener();

addVisibilityButtonsClickEventListener();

addFormEventListener();

addMuteButtonClickEventListener();

addShowHideButtonClickEventListener();

addChatEventListener();
