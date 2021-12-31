import Draw from './game/draw';
import Mouse from './game/mouse';
import { abbrPieceDict } from './game/piece';
import { addChatEventListener } from './chat';
import { t } from './i18n';
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

// 入室～対戦相手待機

let draw: Draw;
/** initCanvas を実行済か */
let doneInitCanvas: boolean = false;
/** canvas 要素 */
const canvass = Array.from(document.getElementsByClassName('canvas')) as HTMLCanvasElement[];
/** canvas 横のメッセージ */
const gameMessage = document.getElementById('game-message');
/** 駒表示ボタン */
const showHideButton = document.getElementById('eye-icon') as HTMLImageElement;
/** ミュート状態か */
let muted: boolean = true;
/** 反対側の盤面の駒を表示するか */
let showOppositePieces: boolean = true;

/** 対戦者か観戦者か */
let myrole: 'play' | 'watch';
/** 自分のユーザ名 */
let myname: string;

// production: io('https://alice-chess-online.herokuapp.com')
// const socket: SocketIOClient.Socket = io('https://alice-chess-online.herokuapp.com');

// // ゲーム進行

// // 勝者が決まったとき
// socket.on(
//   'tell winner',
//   /** 勝者が決まったときの処理
//    * @param winner 勝者のプレイヤー名。undefined なら引き分け
//    */
//   (winner: string | undefined) => {
//     if (winner === undefined) {
//       gameMessage.innerText = t('draw');
//     } else {
//       gameMessage.innerHTML = t('checkmate') + '<br>' + t('winner', winner);
//     }
//     if (!muted) snd('win');
//   }
// );

// // 接続が切れたとき
// socket.on(
//   'player discon',
//   /** @param name 接続が切れたプレイヤー名 */ (name: string) => {
//     alert(t('disconnected'));
//     location.reload();
//   }
// );
