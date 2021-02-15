// ゲーム進行に関わる処理

import { Piece, abbrPieceDict, pieceNames } from './piece';

/** 自分の色と相手の色の対応 */
const opponent: {'W': 'B', 'B': 'W'} = {'W': 'B', 'B': 'W'};

/**
* 盤面を変換する
* @param boards 変換元の盤面
*/
const rotateBoard = (boards: Map<string, string>): Map<string, string> => {
    let orig = boards;
    let res = new Map();
    for (const [pos, piece] of orig.entries()) {
        let [b, x, y] = pos.split(',').map(e => +e);
        res.set(`${b},${7-x},${7-y}`, piece);
    }
    return res;
}

/**
 * color 側がチェックされているか
 * @param color 駒色
 * @param boards color の相手側から見た盤面
 */
const isChecked = (color: 'W' | 'B', boards: Map<string, string>): boolean => {
    let targetPos: number[];
    let enemies: Map<[number, number], Piece> = new Map();
    // キングを探す
    for (const [pos, piece] of boards.entries()) {
        if (piece === color + 'K') {
            targetPos = pos.split(',').map(e => +e);
            break;
        }
    }
    // キングと同じ盤面上にある異色の駒を集める
    for (const [pos, piece] of boards.entries()) {
        if (targetPos[0] === +pos[0] && piece[0] !== color) {
            const enemyPos = pos.split(',').map(e => +e);
            enemies.set([enemyPos[1], enemyPos[2]],
                new abbrPieceDict[piece[1] as pieceNames](
                    opponent[color], +pos[0] as 0 | 1))
        }
    }
    // 同盤面上の敵駒でキングを攻撃しているものがあるか
    for (const [pos, piece] of enemies.entries()) {
        if (~piece.coveringSquares(pos, boards).map(e => String(e))
                .indexOf(String(targetPos.slice(1)))) {
            return true;
        }
    }
    return false;
}

/**
 * color 側が駒を動かせないとき true を返す
 * @param color 駒色
 * @param boards color 側から見た盤面
 * @param advanced2Pos ポーンが 2 歩進んだときの移動先
 */
const cannotMove = (color: 'W' | 'B', boards: Map<string, string>,
        advanced2Pos: number[] | null): boolean => {
    for (const [posStr, pieceName] of boards.entries()) {
        if (color === pieceName[0]) {
            const pos = posStr.split(',').map(e => +e);
            const piece = new abbrPieceDict[pieceName[1] as pieceNames](
                color, pos[0] as 0 | 1);
            for (const dest of piece.validMoves([pos[1], pos[2]], boards, advanced2Pos)) {
                // 駒の各移動先について、移動後にチェック回避できるなら false
                const tmpBoards = new Map(boards);
                renewBoard(pos[0] as 0 | 1, [pos[1], pos[2]], dest, tmpBoards);
                if (!isChecked(color, rotateBoard(tmpBoards))) return false;
            }
        }
    }
    return true;
}

/**
 * en passant の条件を満たすか
 * @param startPos 駒の開始位置
 * @param endPos 駒の行先
 * @param pieceName 駒の名前
 * @param side 駒がいる盤面がどちらか
 * @param advanced2Side 2 歩進んだポーンの移動後の盤面がどちらか
 * @param boards 盤面
 */
const enPassantReq = (startPos: [number, number], endPos: [number, number],
        pieceName: pieceNames, side: 0 | 1,
        advanced2Side: 0 | 1, boards: Map<string, string>): boolean => {
    return pieceName === 'P'
        && side === advanced2Side
        && !boards.has(`${side},` + String(endPos))
        && startPos[1] === endPos[1] + 1
        && Math.abs(startPos[0] - endPos[0]) === 1;
}

/**
 * 駒を移動して盤面を更新する
 * @param boardId 駒の移動前の盤面がどちらか
 * @param startpos 駒の移動前の位置
 * @param endpos 駒の移動後の位置
 * @param boards 盤面
 */
const renewBoard = (boardId: 0 | 1, startpos: [number, number],
        endpos: [number, number], boards: Map<string, string>) => {
    // 駒移動
    boards.set(`${1-boardId},` + String(endpos),
        boards.get(`${boardId},` + String(startpos)));
    boards.delete(`${boardId},` + String(startpos));
    // 敵駒があったら削除
    boards.delete(`${boardId},` + String(endpos));
}

export { opponent, rotateBoard, isChecked, cannotMove, enPassantReq, renewBoard };