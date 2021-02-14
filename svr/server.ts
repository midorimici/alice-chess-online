import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

import config from '../config';
import * as game from './game';
import { pieceNames } from './piece';

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

// 盤面。{'0,0,0': 'WN'} のフォーマット
/** 先手から見た盤面, 後手から見た盤面 */
let boards: [Map<string, string>, Map<string, string>];
/** 先手, 後手の名前と socket id */
let players: [{name: string, id: string}, {name: string, id: string}];
/** 現在のターン */
let curTurn: 0 | 1;
/** 勝者 0 - 先手, 1 - 後手, 2 - 引き分け */
let winner: 0 | 1 | 2;

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
                    boards = [initBoard(), new Map()];
                    boards[1] = config.rotateBoard(boards[0]);
                    curTurn = 0;
                    // クライアントへ送信
                    io.to(info.roomId).emit('watch',
                        [...boards[0]], ...players.map(e => e.name), curTurn, false);
                    io.to(room.player1.id).emit('game',
                        [...boards[0]], 'W', true, ...players.map(e => e.name), false);
                    io.to(room.player2.id).emit('game',
                        [...boards[1]], 'B', false, ...players.map(e => e.name), false);
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
                        [...boards[0]], ...players.map(e => e.name), curTurn, false);
                    if (winner === 0 || winner === 1) {
                        socket.emit('tell winner',
                            players.map(e => e.name)[winner]);
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
             * @param promoteTo プロモーションのとき、プロモーション先
             */
            (boardId: 0 | 1, from: [number, number], to: [number, number],
                promoteTo?: pieceNames) => {
        const roomId = socket.info.roomId;
        const colors: ['W', 'B'] = ['W', 'B'];
        const newBoard = boards[curTurn];
        // 駒の移動
        game.renewBoard(boardId, from, to, newBoard);
        if (promoteTo) {
            // プロモーション
            newBoard.set(`${1-boardId},` + String(to),
                colors[curTurn] + promoteTo);
        }
        // turn 目線のボードを更新する
        boards[curTurn] = newBoard;
        // 相手目線のボードを更新する
        boards[1-curTurn] = config.rotateBoard(newBoard);
        // ターン交代
        curTurn = 1-curTurn as 0 | 1;
        // チェック判定
        const checked = game.isChecked(colors[curTurn], boards[1-curTurn]);
        const freezed = game.cannotMove(colors[curTurn], boards[curTurn]);
        // 勝敗判定
        if (freezed) {
            if (checked) {
                winner = 1-curTurn as 0 | 1;
            } else {
                winner = 2;
            }
        }
        // 盤面データをクライアントへ
        io.to(roomId).emit('watch',
            [...boards[0]], ...players.map(e => e.name), curTurn, checked);
        io.to(players[0].id).emit('game',
            [...boards[0]], 'W', curTurn === 0, ...players.map(e => e.name), checked);
        io.to(players[1].id).emit('game',
            [...boards[1]], 'B', curTurn === 1, ...players.map(e => e.name), checked);
        // 勝者を通知する
        if (winner !== undefined) {
            io.to(roomId).emit('tell winner',
                players.map(e => e.name)[winner]);
        }
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