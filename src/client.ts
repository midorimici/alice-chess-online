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

// let mouse: Mouse;

// /**
//  * 音声を再生する
//  * @param file ファイル名。拡張子除く
//  */
// const snd = (file: string) => {
//   new Audio(`../static/sounds/${file}.wav`).play();
// };

// // 対戦者の処理
// socket.on(
//   'game',
//   /**
//    * 対戦者側のゲーム処理
//    * @param boards 盤面データ
//    * @param color 自分の駒色
//    * @param myturn 現在自分のターンか
//    * @param first 先手のプレイヤー名
//    * @param second 後手のプレイヤー名
//    * @param checked どちらかがチェックされているか
//    * @param advanced2Pos ポーンが 2 歩進んだときの移動先
//    * @param canCastle キャスリングのポテンシャルが残っているか
//    */
//   async (
//     boards: [string, string][],
//     color: 'W' | 'B',
//     myturn: boolean,
//     first: string,
//     second: string,
//     checked: boolean,
//     advanced2Pos: number[] | null,
//     canCastle: { W: [boolean, boolean]; B: [boolean, boolean] }
//   ) => {
//     const boardsMap: Map<string, string> = new Map(boards);
//     /** 選択中の駒の位置 */
//     let originPos: [number, number];
//     /** 行先の位置 */
//     let destPos: [number, number];
//     // 対戦者名表示
//     if (document.getElementById('user-names').innerText === '') {
//       const opponent = color === 'W' ? second : first;
//       document.getElementById('user-names').innerText = `↑ ${opponent}\n↓ ${myname}`;
//     }
//     // 盤面描画
//     if (!doneInitCanvas) await initCanvas();
//     draw.board(boardsMap, color, showOppositePieces);
//     showHideButton.onclick = () => toggleShowHide(boardsMap, color);
//     // 手番の表示
//     // マウスコールバック
//     if (myturn) {
//       gameMessage.innerText = t('isYourTurn');
//       if (!muted) snd('move');

//       for (const [index, canvas] of canvass.entries()) {
//         let prom = false;
//         mouse = new Mouse(canvas);
//         canvas.onclick = (e: MouseEvent) => {
//           const sqPos = mouse.getCoord(e);
//           if (boardsMap.get(`${index},` + String(sqPos))?.[0] === color) {
//             // 自分の駒を選択したとき
//             originPos = sqPos;
//             const pieceClass =
//               abbrPieceDict[boardsMap.get(`${index},` + String(sqPos))[1] as PieceName];
//             const piece = new pieceClass(color, index as 0 | 1);
//             // 行先を描画
//             draw.board(boardsMap, color, showOppositePieces);
//             draw.dest(piece, originPos, boardsMap, advanced2Pos, canCastle);
//             prom = false;
//           } else {
//             if (!prom && boardsMap.has(`${index},` + String(originPos))) {
//               destPos = sqPos;
//               const pieceClass =
//                 abbrPieceDict[boardsMap.get(`${index},` + String(originPos))[1] as PieceName];
//               const piece = new pieceClass(color, index as 0 | 1);
//               if (
//                 piece
//                   .validMoves(originPos, boardsMap, advanced2Pos, canCastle)
//                   .some((e) => String(e) === String(destPos))
//               ) {
//                 // 行先を選択したとき
//                 if (piece.abbr === 'P' && destPos[1] === 0) {
//                   prom = true;
//                 } else {
//                   if (!muted) snd('move');
//                   // サーバへ移動データを渡す
//                   socket.emit('move piece', index, originPos, destPos);
//                 }
//               }
//             }
//             // 盤面描画更新
//             draw.board(boardsMap, color, showOppositePieces);
//             if (prom) {
//               const pieces = ['N', 'B', 'R', 'Q'];
//               for (let i = 2; i <= 5; i++) {
//                 if (sqPos[0] === i && (sqPos[1] === 3 || sqPos[1] === 4)) {
//                   prom = false;
//                   if (!muted) snd('move');
//                   // サーバへ移動データを渡す
//                   socket.emit('move piece', index, originPos, destPos, pieces[i - 2]);
//                 }
//               }
//               // プロモーションの選択肢表示
//               if (String(sqPos) === String(destPos)) draw.promotion(index as 0 | 1, color);
//               else {
//                 prom = false;
//                 originPos = null;
//               }
//             } else {
//               originPos = null;
//             }
//           }
//         };
//       }
//     } else {
//       gameMessage.innerText = t('isOpponentTurn');

//       for (const canvas of canvass) {
//         canvas.onclick = () => {};
//       }
//     }
//     // チェック表示
//     if (checked) {
//       gameMessage.innerHTML = t('check') + '<br>' + gameMessage.innerText;
//       if (!muted) snd('check');
//     }
//   }
// );

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
