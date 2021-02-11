import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

import * as game from './game';

const app: express.Express = express();
app.use(express.static(process.cwd() + '/public'));
const server: http.Server = http.createServer(app);
const io: socketio.Server = require('socket.io')(server, {
    cors: {
        origin: 'https://geister-online.netlify.app',
        methods: ['GET', 'POST']
    }
});

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/public/ja/index.html');
});

// socket.info を使えるようにする
interface customSocket extends socketio.Socket {
    info: {
        roomId: string, role: 'play' | 'watch', name: string
    }
}

/** 部屋番号と部屋のデータの Map
 * @property player1 先に入室したプレイヤー
 * @property player2 後から入室したプレイヤー
 * @property state 部屋の状態
*/
let rooms: Map<string, {
    player1: {id: string, name: string, turn: 0 | 1},
    player2: {id: string, name: string, turn: 0 | 1},
    state: 'waiting' | 'playing'
}> = new Map();

/**
 * 先手の初期盤面を生成する
 * @returns Map
 */
const initBoard = (): Map<string, string> => {
    let m: Map<string, string> = new Map();
    const order: string = 'RNBQKBNR';
    for (let i = 0; i < 8; i++) {
        m.set(`0,${i},7`, 'W' + order[i]);
        m.set(`0,${i},6`, 'WP');
        m.set(`0,${i},0`, 'B' + order[i]);
        m.set(`0,${i},1`, 'BP');
    }
    return m;
}

/**
 * 盤面を変換する
 * @param to 変換先。 0 -> 先手, 1 -> 後手
 */
const rotateBoard = (to: 0 | 1): Map<string, string> => {
    let orig = board[1-to];
    let res = new Map();
    for (const [pos, piece] of orig.entries()) {
        let [b, x, y] = pos.split(',').map(e => +e);
        res.set(`${b},${7-x},${7-y}`, piece);
    }
    return res;
}

/**
 * side が勝利条件を満たすか
 * @param taken それぞれが取った駒の色と数
 * @param posOnBoard 盤面上にある駒の位置リスト
 * @param side 先手か後手か
 * @param moved side が今駒を動かしたか
 */
const winReq = (taken: [{'R': number, 'B': number},
        {'R': number, 'B': number}],
        posOnBoard: string[], side: 0 | 1, moved: boolean): boolean => {
    if (moved) {
        // 青を4つ取った
        // or 青が盤面に出た
        return (taken[side]['B'] === 4
            || (posOnBoard.indexOf('0,-1') !== -1
                || posOnBoard.indexOf('5,-1') !== -1));
    } else {
        // 赤を4つ取らせた
        return taken[(side+1)%2]['R'] === 4;
    }
}

// 盤面。{'0,0,0': 'WN'} のフォーマット
/** 先手から見た盤面, 後手から見た盤面 */
let board: [Map<string, string>, Map<string, string>];
/** 先手, 後手の名前と socket id */
let players: [{name: string, id: string}, {name: string, id: string}];
/** 現在のターン */
let curTurn: 0 | 1 = 0;
/** それぞれが取った駒の色と数 */
let takenPieces: [{'R': number, 'B': number}, {'R': number, 'B': number}]
    = [{'R': 0, 'B': 0}, {'R': 0, 'B': 0}];
/** 勝者 0 - 先手, 1 - 後手 */
let winner: 0 | 1;

io.on('connection', (socket: customSocket) => {
    socket.on('enter room', 
            /**
             * 入室したときのサーバ側の処理
             * @param info 入室者のデータ
             */
            (info: {roomId: string, role: 'play' | 'watch', name: string}) => {
        socket.info = info;
        const room = rooms.get(info.roomId);
        if (info.role === 'play') {
            // 対戦者として参加
            if (room) {
                // 指定のルームに対戦者がいたとき
                if (room.state === 'waiting') {
                    // 対戦者が1人待機している
                    room.player2 = {
                        id: socket.id,
                        name: info.name,
                        turn: 1
                    };
                    room.state = 'playing';
                    socket.join(info.roomId);
                    players = [
                        {
                            name: room.player1.name,
                            id: room.player1.id
                        },
                        {
                            name: room.player2.name,
                            id: room.player2.id
                        }
                    ];
                    // 盤面生成
                    board = [initBoard(), new Map()];
                    board[1] = rotateBoard(1);
                    // クライアントへ送信
                    io.to(info.roomId).emit('watch',
                        [...board[0]], ...players.map(e => e.name), curTurn, false, takenPieces);
                    io.to(room.player1.id).emit('game',
                        [...board[0]], 'W', true, ...players.map(e => e.name), false, takenPieces);
                    io.to(room.player2.id).emit('game',
                        [...board[1]], 'B', false, ...players.map(e => e.name), false, takenPieces);
                } else {
                    // 対戦者がすでに2人いる
                    socket.emit('room full', info.roomId);
                    socket.info.role = 'watch';
                }
            } else {
                // 新たにルームを作成する
                rooms.set(info.roomId, {
                    player1: {
                        id: socket.id,
                        name: info.name,
                        turn: 0
                    },
                    player2: {
                        id: '',
                        name: '',
                        turn: 0
                    },
                    state: 'waiting'
                });
                socket.join(info.roomId);
                socket.emit('wait opponent');
            }
        } else {
            // 観戦者として参加
            if (room) {
                // 指定のルームが存在するとき
                socket.join(info.roomId);
                if (room.state === 'waiting') {
                    // 対戦者が1人待機している
                    socket.emit('wait opponent');
                } else {
                    // 対戦者がすでに2人いて対戦中
                    socket.emit('watch',
                        [...board[0]], ...players.map(e => e.name), curTurn, false, takenPieces);
                    if (winner === 0 || winner === 1) {
                        socket.emit('tell winner',
                            players.map(e => e.name)[winner], [...board[0]],
                            ...players.map(e => e.name), takenPieces);
                    }
                }
            } else {
                // 指定したルームがないとき
                socket.emit('no room', info.roomId);
            }
        }
    });

    socket.on('move piece',
            /**
             * 駒を動かしたときのサーバ側の処理
             * @param boardId 駒の移動前の盤面がどちらか
             * @param from 駒の移動前の位置
             * @param to 駒の移動後の位置
             */
            (boardId: 0 | 1, from: [number, number], to: [number, number]) => {
        const roomId = socket.info.roomId;
        const newBoard = board[curTurn];
        // 駒の移動
        game.renewBoard(boardId, from, to, newBoard);
        // 相手の駒を取ったとき
        /*
        if (board.has(String(dest)) && board.get(String(dest)).turn !== turn) {
            // 取った駒の色を記録する
            takenPieces[turn][board.get(String(dest)).color] += 1;
        }*/
        // turn 目線のボードを更新する
        board[curTurn] = newBoard;
        // 相手目線のボードを更新する
        board[1-curTurn] = rotateBoard(1-curTurn as 0 | 1);
        // ターン交代
        curTurn = 1-curTurn as 0 | 1;
        // 勝敗判定
        /*
        if (winReq(takenPieces, Array.from(board.keys()), turn, true)) {
            winner = turn;
        } else if (winReq(takenPieces, Array.from(board.keys()), (turn+1)%2 as 0 | 1, false)) {
            winner = (turn+1)%2 as 0 | 1;
        }*/
        // チェック判定
        const checked = game.isChecked('W', board[1]) || game.isChecked('B', board[0]);
        console.log(game.cannotMove('W', board[1]) || game.cannotMove('B', board[0]))
        // 盤面データをクライアントへ
        io.to(roomId).emit('watch',
            [...board[0]], ...players.map(e => e.name), curTurn, checked, takenPieces);
        io.to(players[0].id).emit('game',
            [...board[0]], 'W', curTurn === 0, ...players.map(e => e.name), checked, takenPieces);
        io.to(players[1].id).emit('game',
            [...board[1]], 'B', curTurn === 1, ...players.map(e => e.name), checked, takenPieces);
        // 勝者を通知する
        /*
        if (winner === 0 || winner === 1) {
            io.to(roomId).emit('tell winner to audience and first',
                players.map(e => e.name)[winner], [...board[0]]
                , ...players.map(e => e.name), takenPieces);
            io.to(second.id).emit('tell winner to second',
                players.map(e => e.name)[winner], [...board[1]]
                , ...players.map(e => e.name), takenPieces);
        }*/
    });

    socket.on('chat message', (msg: string) => {
        io.to(socket.info.roomId).emit('chat message',
            msg, socket.info.role === 'play', socket.info.name);
    })

    socket.on('disconnect', () => {
        const info = socket.info;
        // 接続が切れたとき
        if (info) {
            // ルームに入っていたとき
            if (info.role === 'play') {
                // 対戦者としてルームにいたとき
                rooms.delete(info.roomId);
                // 観戦者ともう一方の対戦者も退出させる
                socket.to(info.roomId).leave(info.roomId);
                socket.to(info.roomId).emit('player discon', info.name);
            }
        }
    });
});

server.listen(process.env.PORT || 3000);