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

// // 観戦者の処理
// socket.on(
//   'watch',
//   /**
//    * 観戦者側のゲーム処理
//    * @param boards 盤面データ
//    * @param first 先手のプレイヤー名
//    * @param second 後手のプレイヤー名
//    * @param turn 現在のターン
//    * @param checked どちらかがチェックされているか
//    * @param omitMessage 手番やチェックのメッセージを省略するか
//    */
//   async (
//     boards: [string, string][],
//     first: string,
//     second: string,
//     turn: 0 | 1,
//     checked: boolean,
//     omitMessage: boolean = false
//   ) => {
//     if (myrole === 'watch') {
//       const boardsMap: Map<string, string> = new Map(boards);
//       // 対戦者名表示
//       if (document.getElementById('user-names').innerText === '') {
//         document.getElementById('user-names').innerText = `↑ ${second}\n↓ ${first}`;
//       }
//       // チェック表示
//       if (checked) {
//         gameMessage.innerHTML = t('check') + '<br>' + gameMessage.innerText;
//       }
//       // 盤面描画
//       if (!doneInitCanvas) await initCanvas();
//       draw.board(boardsMap, 'W', showOppositePieces);
//       showHideButton.onclick = () => toggleShowHide(boardsMap, 'W');
//       if (omitMessage) return;
//       // 手番表示
//       const curPlayer: string = turn === 0 ? first : second;
//       gameMessage.innerText = t('isPlayersTurn', curPlayer);
//       if (!muted) snd('move');
//       // チェック表示
//       if (checked) {
//         gameMessage.innerHTML = t('check') + '<br>' + gameMessage.innerText;
//         if (!muted) snd('check');
//       }
//     }
//   }
// );

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
