import Draw from './draw';
import Mouse from './mouse';
import Piece from './piece';

/** 言語が英語である */
const isEN: boolean = location.pathname === '/en/';

// 入室～対戦相手待機

let draw: Draw;
/** initCanvas を実行済か */
let doneInitCanvas: boolean = false;
/** canvas 要素 */
const canvass = Array.from(document.getElementsByClassName('canvas')) as HTMLCanvasElement[];
/** canvas 横のメッセージ */
const gameMessage = document.getElementById('game-message');
/** ミュートボタン */
const muteButton = document.getElementById('mute-icon') as HTMLImageElement;
/** ミュート状態か */
let muted: boolean = true;

/** 入力フォームを非表示にし、canvas などを表示する */
const initCanvas = () => {
    document.getElementById('settings').style.display = 'none';
    
    const cw: number = document.documentElement.clientWidth;
    const ch: number = document.documentElement.clientHeight;

    if (cw < ch || ch < 720) {
        document.getElementById('logo').style.display = 'none';
        document.getElementById('info-icon').style.display = 'none';
        document.getElementsByTagName('footer')[0].style.display = 'none';
    }

    const max: number = cw < ch ? ch : cw;
    const cvsize: string = (0.4*max).toString();
    for (const canvas of canvass) {
        canvas.setAttribute('width', cvsize);
        canvas.setAttribute('height', cvsize);
    }

    draw = new Draw(canvass, isEN);
    doneInitCanvas = true;
    document.getElementById('game-container').style.display = 'flex';
};

/** 対戦者か観戦者か */
let myrole: 'play' | 'watch';
/** 自分のユーザ名 */
let myname: string;

// フォーム取得
// production: https://geister-online.herokuapp.com
const socket: SocketIOClient.Socket = io();
const form = document.getElementById('form') as HTMLFormElement;
form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    const data = new FormData(form);
    const info = {
        roomId: data.get('room') as string,
        role: data.get('role') as ('play' | 'watch'),
        name: data.get('username') === ''
            ? (isEN ? 'anonymous' : '名無し')
            : data.get('username') as string,
    };
    myrole = info.role;
    myname = info.name;
    socket.emit('enter room', info);
}, false);

// 部屋がいっぱいだったとき
socket.on('room full', /** @param id 部屋番号 */ (id: string) => {
    const p: HTMLElement = document.getElementById('message');
    p.innerText = isEN
    ? `The room ${id} is full. You cannot join in as a player.`
    : `ルーム ${id} はいっぱいです。対戦者として参加することはできません。`;
});

// 空室を観戦しようとしたとき
socket.on('no room', /** @param id 部屋番号 */ (id: string)=> {
    const p: HTMLElement = document.getElementById('message');
    p.innerText = isEN
    ? `No player is present in the room ${id}.`
    : `ルーム ${id} では対戦が行われていません。`;
});

// 対戦相手を待っているとき
socket.on('wait opponent', () => {
    if (!doneInitCanvas) {initCanvas()};
    gameMessage.innerText = isEN
        ? 'Waiting for the opponent...'
        : '対戦相手の入室を待っています...'
});

let mouse: Mouse;

/**
 * 音声を再生する
 * @param file ファイル名。拡張子除く
 */
const snd = (file: string) => {
    new Audio(`../static/sounds/${file}.wav`).play();
};

// ゲーム進行

// 対戦者の処理
socket.on('game', 
        /**
         * 対戦者側のゲーム処理
         * @param board 盤面データ
         * @param turn 自分が先手か後手か
         * @param myturn 現在自分のターンか
         * @param first 先手のプレイヤー名
         * @param second 後手のプレイヤー名
         * @param takenPieces それぞれが取った駒の色と数
         */
        (board: [string, string][],
        turn: 0 | 1, myturn: boolean,
        first: string, second: string,
        takenPieces: [{'R': number, 'B': number}, {'R': number, 'B': number}]) => {
    const boardmap: Map<string, string> = new Map(board);
    /** 選択中の駒の位置 */
    let selectingPos: [number, number];
    // 対戦者名表示
    if (document.getElementById('user-names').innerText === '') {
        const opponent = turn === 0 ? second : first;
        document.getElementById('user-names').innerText
            = `↑ ${opponent}\n↓ ${myname}`;
    }
    // 盤面描画
    draw.board(boardmap, turn);
    //draw.takenPieces(takenPieces, turn);
    // 手番の表示
    /* マウスイベント
    if (myturn) {
        gameMessage.innerText = isEN ? "It's your turn." : 'あなたの番です。';
        if (!muted) snd('move');

        for (const canvas of canvass) {
            mouse = new Mouse(canvas);
            canvas.onclick = (e: MouseEvent) => {
                const sqPos = mouse.getCoord(e);
                if (boardmap.has(String(sqPos))
                        && boardmap.get(String(sqPos)).turn === turn) {
                    // 自分の駒を選択したとき
                    selectingPos = sqPos;
                    const pieceData = Object.values(
                        boardmap.get(String(sqPos))) as ['R' | 'B', 0 | 1];
                    const piece = new Piece(...pieceData);
                    // 行先を描画
                    draw.board(boardmap, turn, first, second);
                    //draw.dest(piece, selectingPos, boardmap);
                    //draw.takenPieces(takenPieces, turn);
                } else {
                    if (boardmap.has(String(selectingPos))) {
                        const pieceData = Object.values(
                            boardmap.get(String(selectingPos))) as ['R' | 'B', 0 | 1];
                        const piece = new Piece(...pieceData);
                        if (piece.coveringSquares(selectingPos).some(e =>
                                String(e) === String(sqPos))) {
                            // 行先を選択したとき
                            // 駒の移動
                            boardmap.set(String(sqPos), boardmap.get(String(selectingPos)));
                            boardmap.delete(String(selectingPos));
                            if (!muted) snd('move');
                            // サーバへ移動データを渡す
                            socket.emit('move piece', turn, selectingPos, sqPos);
                        }
                    }
                    // 盤面描画更新
                    draw.board(boardmap, turn, first, second);
                    //draw.takenPieces(takenPieces, turn);
                    selectingPos = null;
                }
            }
        }
    } else {
        gameMessage.innerText = isEN ? "It's your opponent's turn." : '相手の番です。';

        for (const canvas of canvass) {
            canvas.onclick = () => {};
        }
    }
    */
});

// 観戦者の処理
socket.on('watch',
        /**
         * 観戦者側のゲーム処理
         * @param board 盤面データ
         * @param first 先手のプレイヤー名
         * @param second 後手のプレイヤー名
         * @param turn 現在のターン
         * @param takenPieces それぞれが取った駒の色と数
         */
        (board: [string, string][],
        first: string, second: string, turn: 0 | 1,
        takenPieces: [{'R': number, 'B': number}, {'R': number, 'B': number}]) => {
    if (myrole === 'watch') {
        if (!doneInitCanvas) {initCanvas()};
        const boardmap: Map<string, string> = new Map(board);
        draw.board(boardmap, 0, true);
        //draw.takenPieces(takenPieces, 0);
        const curPlayer: string = turn === 0 ? first : second;
        gameMessage.innerText = isEN
        ? `It's ${curPlayer}'s turn.`
        : `${curPlayer} さんの番です。`;
        if (!muted) snd('move');
    }
});

// 勝者が決まったとき
socket.on('tell winner',
        /** 勝者が決まったときの処理
         * @param winner 勝者のプレイヤー名
        */
        (winner: string) => {
    gameMessage.innerText = isEN ? `${winner} won!` : `${winner} の勝ち！`;
    if (!muted) snd('win');
});

// 接続が切れたとき
socket.on('player discon',
        /** @param name 接続が切れたプレイヤー名 */ (name: string) => {
    alert(isEN
        ? `${name}'s connection is closed.`
        : `${name} さんの接続が切れました。`);
    location.reload();
});



// ミュートボタン
muteButton.onclick = () => {
    muteButton.src = muted
        ? '../static/svg/volume-up-solid.svg'
        : '../static/svg/volume-mute-solid.svg';
    muteButton.title = muted
    ? (isEN ? 'Mute' : 'ミュート')
    : (isEN ? 'Unmute' : 'ミュート解除');
    muted = !muted;
};



// チャット
const chatForm = document.getElementById('chat-form') as HTMLFormElement;
const chatInput = document.getElementById('chat-input') as HTMLInputElement;
const chatSendButton = document.getElementById('chat-send-icon');
chatForm.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    if (chatInput.value) {
        socket.emit('chat message', chatInput.value);
        chatInput.value = '';
    }
});

chatSendButton.onclick = () => {
    if (chatInput.value) {
        socket.emit('chat message', chatInput.value);
        chatInput.value = '';
    }
};

const ul = document.getElementById('chat-messages');
socket.on('chat message', 
        /**
         * チャット受信の処理
         * @param msg 入力されたメッセージ
         * @param isPlayer 入力した人が対戦者か
         * @param name 入力した人の名前
         */
        (msg: string, isPlayer: boolean, name: string) => {
    const item = document.createElement('li');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'chat-name';
    nameSpan.innerText = name;

    if (isPlayer) {
        const icon = document.createElement('img');
        icon.className = 'chat-player-icon';
        icon.src = '../static/svg/ghost-solid.svg';
        icon.alt = 'player-icon';
        icon.title = isEN ? 'Player' : '対戦者';
        nameSpan.appendChild(icon);
    }

    item.appendChild(nameSpan);

    const msgSpan = document.createElement('span');
    msgSpan.innerText = msg;
    item.appendChild(msgSpan);

    ul.appendChild(item);
    ul.scrollTop = ul.scrollHeight;
});



// info ボタン
const infoBtn = document.getElementById('info-icon');
infoBtn.onclick = () => {
    document.getElementById('info-overlay').style.display = 'flex';
};

const infoCloseBtn = document.getElementById('close-icon');
infoCloseBtn.onclick = () => {
    document.getElementById('info-overlay').style.display = 'none';
};