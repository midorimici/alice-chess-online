import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

import * as game from './game';
import { pieceNames } from './piece';

const app: express.Express = express();
app.use(express.static(process.cwd() + '/public'));
const server: http.Server = http.createServer(app);
const io: socketio.Server = require('socket.io')(server, {
    cors: {
        origin: 'https://alice-chess-online.netlify.app',
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
 * @property players 先手, 後手の名前と socket id
 * @property state 部屋の状態
 * @property boards 先手から見た盤面, 後手から見た盤面。{'0,0,0': 'WN'} のフォーマット
 * @property curTurn 現在のターン
 * @property winner 勝者 0 - 先手, 1 - 後手, 2 - 引き分け
 * @property canCastle キャスリングのポテンシャルが残っているか
*/
let rooms: Map<string, {
    players: [{name: string, id: string}, {name: string, id: string}],
    watchersNum: number,
    state: 'waiting' | 'playing',
    boards: [Map<string, string>, Map<string, string>],
    curTurn: 0 | 1,
    winner: 0 | 1 | 2,
    canCastle: {'W': [boolean, boolean], 'B': [boolean, boolean]}
}> = new Map();

/**
 * パブリックルームのキーを生成する
 * 先頭に半角スペースが入った3桁のランダムな数字
 */
const generatePublicRoomKey = (): string => {
    let res: string = ' ' + String(Math.random()).slice(-3);
    while (rooms.has(res)) {
        res = ' ' + String(Math.random()).slice(-3);
    }
    return res;
}

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

io.on('connection', (socket: customSocket) => {
    socket.on('enter room', 
            /**
             * 入室したときのサーバ側の処理
             * @param info 入室者のデータ
             */
            (info: {
                private: boolean, roomId: string, role: 'play' | 'watch', name: string
            }) => {
        socket.info = info;
        // public のとき既存の部屋を探し、なかったら新たに生成
        const pubRooms = Array.from(rooms.keys())
            .filter((k: string) => k[0] === ' ');
        const waitingPubRooms = pubRooms.filter((k: string) =>
            rooms.get(k).state === 'waiting');
        const playingPubRooms = pubRooms.filter((k: string) =>
            rooms.get(k).state === 'playing');
        const targetRooms = info.role === 'play'
            ? waitingPubRooms
            : (playingPubRooms.length
                ? playingPubRooms
                : waitingPubRooms);
        const roomId = info.private ? info.roomId
            : (targetRooms[Math.floor(Math.random()*targetRooms.length)]
                ?? generatePublicRoomKey());
        socket.info.roomId = roomId;
        const room = rooms.get(roomId);
        
        if (info.role === 'play') {
            // 対戦者として参加
            if (room) {
                // 指定のルームに対戦者がいたとき
                if (room.state === 'waiting') {
                    const players = room.players;
                    // 対戦者が1人待機している
                    players[1] = {
                        name: info.name,
                        id: socket.id
                    };
                    room.state = 'playing';
                    socket.join(roomId);
                    // 変数の初期化
                    // 盤面生成
                    room.boards = [initBoard(), new Map()];
                    room.boards[1] = game.rotateBoard(room.boards[0]);
                    const boards = room.boards;
                    // クライアントへ送信
                    io.to(roomId).emit('watch',
                        [...boards[0]], ...players.map(e => e.name), room.curTurn, false);
                    io.to(players[0].id).emit('game',
                        [...boards[0]], 'W', true, ...players.map(e => e.name), false,
                        null, room.canCastle);
                    io.to(players[1].id).emit('game',
                        [...boards[1]], 'B', false, ...players.map(e => e.name), false,
                        null, room.canCastle);
                    socket.emit('audience i/o', room.watchersNum);
                } else {
                    // 対戦者がすでに2人いる
                    socket.emit('room full', roomId);
                    socket.info.role = 'watch';
                }
            } else {
                // 新たにルームを作成する
                rooms.set(roomId,
                    {
                        players: [{
                            name: info.name,
                            id: socket.id
                        }, 
                        {
                            name: '',
                            id: ''
                        }],
                        watchersNum: 0,
                        state: 'waiting',
                        boards: null,
                        curTurn: 0,
                        winner: null,
                        canCastle: {'W': [true, true], 'B': [true, true]}
                    });
                socket.join(roomId);
                socket.emit('wait opponent');
            }
        } else {
            // 観戦者として参加
            if (room) {
                // 指定のルームが存在するとき
                socket.join(roomId);
                if (room.state === 'waiting') {
                    // 対戦者が1人待機している
                    socket.emit('wait opponent');
                } else {
                    // 対戦者がすでに2人いて対戦中
                    if (room.winner == null) {
                        // 勝敗が決まっていないとき
                        socket.emit('watch',
                            [...room.boards[0]], ...room.players.map(e => e.name), room.curTurn, false);
                    } else {
                        // 勝敗が決まっているとき
                        socket.emit('watch',
                            [...room.boards[0]], ...room.players.map(e => e.name), room.curTurn, false, true);
                        socket.emit('tell winner',
                            room.players.map(e => e.name)[room.winner]);
                    }
                }
                // 観戦者数を更新
                room.watchersNum++;
                io.to(roomId).emit('audience i/o', room.watchersNum);
            } else {
                // 指定したルームがないとき
                if (info.private) {
                    socket.emit('no private room', roomId);
                } else {
                    socket.emit('no public room');
                }
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
        const room = rooms.get(roomId);
        const players = room.players;
        const boards = room.boards;
        let curTurn = room.curTurn;
        let canCastle = room.canCastle;

        const colors: ['W', 'B'] = ['W', 'B'];
        const newBoard = boards[curTurn];
        const pieceName = newBoard.get(`${boardId},` + String(from))?.[1] as pieceNames;

        // キャスリング
        // ルークが動いた
        if (pieceName === 'R') {
            // クイーンサイド
            if (String(from) === '0,7') {
                canCastle[colors[curTurn]][curTurn] = false;
            }
            // キングサイド
            if (String(from) === '7,7') {
                canCastle[colors[curTurn]][1-curTurn] = false;
            }
        }
        // キングが動いた
        if (pieceName === 'K') {
            canCastle[colors[curTurn]] = [false, false];
            // キャスリングが行われたときルークを動かす
            if (Math.abs(to[0]-from[0]) === 2) {
                let newX: number, oldX: number;
                switch (to[0]) {
                case 2:
                    // 白クイーンサイド
                    [newX, oldX] = [3, 0];
                    break;
                case 6:
                    // 白キングサイド
                    [newX, oldX] = [5, 7];
                    break;
                case 5:
                    // 黒クイーンサイド
                    [newX, oldX] = [4, 7];
                    break;
                case 1:
                    // 黒キングサイド
                    [newX, oldX] = [2, 0];
                    break;
                }
                newBoard.set(`${1-boardId},${newX},7`, colors[curTurn] + 'R');
                newBoard.delete(`${boardId},${oldX},7`);
            }
        }

        // en passant
        if (game.enPassantReq(from, to,
                pieceName, boardId,
                boardId, newBoard)) {
            // ポーンを除去する
            newBoard.delete(`${boardId},${to[0]},${to[1]+1}`);
        }
        // ポーンが 2 歩進んだときの移動先
        const advanced2Pos = (pieceName === 'P' && from[1] - to[1] === 2)
            ? [1-boardId, ...to] : null;
        
        // 駒の移動
        game.renewBoard(boardId, from, to, newBoard);
        if (promoteTo) {
            // プロモーション
            newBoard.set(`${1-boardId},` + String(to),
                colors[curTurn] + promoteTo);
        }
        // 相手目線のボードを更新する
        boards[1-curTurn] = game.rotateBoard(newBoard);
        // ターン交代
        room.curTurn = 1-curTurn as 0 | 1;
        curTurn = room.curTurn;
        // チェック判定
        const checked = game.isChecked(colors[curTurn], boards[1-curTurn]);
        const freezed = game.cannotMove(colors[curTurn], boards[curTurn],
            advanced2Pos, canCastle);
        // 勝敗判定
        if (freezed) {
            if (checked) {
                room.winner = 1-curTurn as 0 | 1;
            } else {
                room.winner = 2;
            }
        }
        // 盤面データをクライアントへ
        io.to(roomId).emit('watch',
            [...boards[0]], ...players.map(e => e.name), curTurn, checked);
        io.to(players[0].id).emit('game',
            [...boards[0]], 'W', curTurn === 0, ...players.map(e => e.name),
                checked, advanced2Pos, canCastle);
        io.to(players[1].id).emit('game',
            [...boards[1]], 'B', curTurn === 1, ...players.map(e => e.name),
                checked, advanced2Pos, canCastle);
        // 勝者を通知する
        if (room.winner != null) {
            io.to(roomId).emit('tell winner',
                players.map(e => e.name)[room.winner]);
        }
    });

    socket.on('chat message', (msg: string) => {
        io.to(socket.info.roomId).emit('chat message',
            msg, socket.info.role === 'play', socket.info.name);
    })

    socket.on('disconnect', () => {
        // 接続が切れたとき
        const info = socket.info;
        if (info) {
            // ルームに入っていたとき
            const room = rooms.get(info.roomId);
            if (room) {
                if (info.role === 'play') {
                    // 対戦者としてルームにいたとき
                    rooms.delete(info.roomId);
                    // 観戦者ともう一方の対戦者も退出させる
                    socket.to(info.roomId).leave(info.roomId);
                    socket.to(info.roomId).emit('player discon', info.name);
                } else {
                    // 観戦者数を減らす
                    room.watchersNum = Math.max(room.watchersNum-1, 0);
                    io.to(info.roomId).emit('audience i/o', room.watchersNum);
                }
            }
        }
    });
});

server.listen(process.env.PORT || 3000);