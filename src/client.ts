import { addChatEventListener } from './chat';
import {
  addFormEventListener,
  addInfoButtonClickEventListener,
  addLanguageButtonClickEventListener,
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

addLanguageButtonClickEventListener();
