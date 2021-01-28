import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

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
 * @property ready 駒の配置の準備が完了したプレイヤー数
*/
let rooms: Map<string, {
    player1: {id: string, name: string, turn: 0 | 1},
    player2: {id: string, name: string, turn: 0 | 1},
    state: string,
    ready: number
}> = new Map();
/** 先手の初期配置 */
let order1: Map<string, 'R' | 'B'>;
/** 後手の初期配置 */
let order2: Map<string, 'R' | 'B'>;
/** 先手から見た盤面 */
let board1: Map<string, {color: 'R' | 'B', turn: 0 | 1}>;
/** 後手から見た盤面 */
let board2: Map<string, {color: 'R' | 'B', turn: 0 | 1}>;
/** 先手の名前と socket id */
let first: {name: string, id: string};
/** 後手の名前と socket id */
let second: {name: string, id: string};
/** 現在のターン */
let curTurn: 0 | 1 = 0;
/** それぞれが取った駒の色と数 */
let takenPieces: [{'R': number, 'B': number}, {'R': number, 'B': number}]
    = [{'R': 0, 'B': 0}, {'R': 0, 'B': 0}];
/** 勝者 0 - 先手, 1 - 後手 */
let winner: 0 | 1;

/**
 * 初期盤面を生成する
 * @param order1 先手の初期配置
 * @param order2 後手の初期配置
 * @param turn どちら目線か
 * @returns クライアントへの転送のためシリアライズされた Map
 */
const initBoard = (
        order1: Map<string, 'R' | 'B'>, order2: Map<string, 'R' | 'B'>,
        turn: 0 | 1
        ): [string, {color: 'R' | 'B', turn: 0 | 1}][] => {
    let m: Map<string, {color: 'R' | 'B', turn: 0 | 1}> = new Map();
    for (let [k, v] of order1) {
        const [x, y] = k.split(',').map((e: string) => +e);
        if (turn === 0) {
            m.set(`${x},${y+2}`, {color: v, turn: 0});
        } else {
            m.set(`${5-x},${3-y}`, {color: v, turn: 0});
        }
    }
    for (let [k, v] of order2) {
        const [x, y] = k.split(',').map((e: string) => +e);
        if (turn === 0) {
            m.set(`${5-x},${3-y}`, {color: v, turn: 1});
        } else {
            m.set(`${x},${y+2}`, {color: v, turn: 1});
        }
    }
    return [...m];
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
                if (room.state === 'waiting opponent') {
                    // 対戦者が1人待機している
                    room.player2 = {
                        id: socket.id,
                        name: info.name,
                        turn: 0
                    };
                    room.state = 'waiting placing';
                    socket.join(info.roomId);
                    io.to(info.roomId).emit('wait placing');
                    io.to(room.player1.id).emit('place pieces');
                    io.to(room.player2.id).emit('place pieces');
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
                    state: 'waiting opponent',
                    ready: 0
                });
                socket.join(info.roomId);
                socket.emit('wait opponent');
            }
        } else {
            // 観戦者として参加
            if (room) {
                // 指定のルームが存在するとき
                socket.join(info.roomId);
                if (room.state === 'waiting opponent') {
                    // 対戦者が1人待機している
                    socket.emit('wait opponent');
                } else if (room.state === 'waiting placing') {
                    // 対戦者が駒の配置を決めている
                    socket.emit('wait placing');
                } else {
                    // 対戦者がすでに2人いて対戦中
                    socket.emit('watch',
                        [...board1], first.name, second.name, curTurn, takenPieces);
                    if (winner === 0 || winner === 1) {
                        socket.emit('tell winner to audience and first',
                            [first.name, second.name][winner], [...board1],
                            first.name, second.name, takenPieces);
                    }
                }
            } else {
                // 指定したルームがないとき
                socket.emit('no room', info.roomId);
            }
        }
    });

    socket.on('decided place',
            /**
             * 駒の配置を決定したときのサーバ側の処理
             * @param poslist どこにどの色の駒を配置したかを表すリスト
             */
            (poslist: [string, 'R' | 'B'][]) => {
        const roomId = socket.info.roomId;
        const posmap = new Map(poslist);
        const room = rooms.get(roomId);
        room.ready = room.ready + 1;
        if (room.ready === 1) {
            // 先手
            order1 = posmap;
            if (room.player1.id === socket.id) {
                io.to(room.player1.id).emit('wait placing');
            } else {
                io.to(room.player2.id).emit('wait placing');
            }
        } else if (room.ready === 2) {
            // 後手
            order2 = posmap;
            if (room.player1.id === socket.id) {
                room.player1.turn = 1;
            } else {
                room.player2.turn = 1;
            }
            room.state = 'playing';
            board1 = new Map(initBoard(order1, order2, 0));
            board2 = new Map(initBoard(order1, order2, 1));
            first = room.player1.turn === 0 ? {
                name: room.player1.name,
                id: room.player1.id
            } : {
                name: room.player2.name,
                id: room.player2.id
            };
            second = room.player1.turn === 1 ? {
                name: room.player1.name,
                id: room.player1.id
            } : {
                name: room.player2.name,
                id: room.player2.id
            };
            curTurn = 0;
            takenPieces = [{'R': 0, 'B': 0}, {'R': 0, 'B': 0}];
            winner = undefined;
            io.to(roomId).emit('watch',
                [...board1], first.name, second.name, curTurn, takenPieces);
            io.to(first.id).emit('game',
                [...board1], 0, true, first.name, second.name, takenPieces);
            io.to(second.id).emit('game',
                [...board2], 1, false, first.name, second.name, takenPieces);
        }
    });

    socket.on('move piece',
            /**
             * 駒を動かしたときのサーバ側の処理
             * @param turn 動かした人が先手か後手か
             * @param origin 駒の移動元の位置。ゲーム内座標
             * @param dest 駒の移動先の位置。ゲーム内座標
             */
            (turn: 0 | 1, origin: [number, number], dest: [number, number]) => {
        const roomId = socket.info.roomId;
        let board = [board1, board2][turn];
        let another = [board1, board2][(turn+1)%2];
        // 相手の駒を取ったとき
        if (board.has(String(dest)) && board.get(String(dest)).turn !== turn) {
            // 取った駒の色を記録する
            takenPieces[turn][board.get(String(dest)).color] += 1;
        }
        // turn 目線のボードを更新する
        board.set(String(dest), board.get(String(origin)));
        board.delete(String(origin));
        // 座標変換
        origin = origin.map((x: number) => 5-x) as [number, number];
        dest = dest.map((x: number) => 5-x) as [number, number];
        // 相手目線のボードを更新する
        another.set(String(dest), another.get(String(origin)));
        another.delete(String(origin));
        // ターン交代
        curTurn = (curTurn+1)%2 as 0 | 1;
        // 勝敗判定
        if (winReq(takenPieces, Array.from(board.keys()), turn, true)) {
            winner = turn;
        } else if (winReq(takenPieces, Array.from(board.keys()), (turn+1)%2 as 0 | 1, false)) {
            winner = (turn+1)%2 as 0 | 1;
        }
        // 盤面データをクライアントへ
        io.to(roomId).emit('watch',
            [...board1], first.name, second.name, curTurn, takenPieces);
        io.to(first.id).emit('game',
            [...board1], 0, curTurn === 0, first.name, second.name, takenPieces);
        io.to(second.id).emit('game',
            [...board2], 1, curTurn === 1, first.name, second.name, takenPieces);
        // 勝者を通知する
        if (winner === 0 || winner === 1) {
            io.to(roomId).emit('tell winner to audience and first',
                [first.name, second.name][winner], [...board1]
                , first.name, second.name, takenPieces);
            io.to(second.id).emit('tell winner to second',
                [first.name, second.name][winner], [...board2]
                , first.name, second.name, takenPieces);
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