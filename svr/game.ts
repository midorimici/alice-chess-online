// ゲーム進行に関わる処理

import { Piece, abbrPieceDict, pieceNames } from './piece';

/**
 * color 側がチェックされているか
 * @param color 駒色
 * @param board 盤面
 */
const isChecked = (color: 'W' | 'B', board: Map<string, string>): boolean => {
    let targetPos: number[];
    let enemies: Map<[number, number], Piece> = new Map();
    // キングを探す
    for (const [pos, piece] of board.entries()) {
        if (piece === color + 'K') {
            targetPos = pos.split(',').map(e => +e);
            break;
        }
    }
    // キングと同じ盤面上にある異色の駒を集める
    for (const [pos, piece] of board.entries()) {
        if (targetPos[0] === +pos[0] && piece[0] !== color) {
            const enemyPos = pos.split(',').map(e => +e);
            enemies.set([enemyPos[1], enemyPos[2]],
                new abbrPieceDict[piece[1] as pieceNames](
                    color === 'W' ? 'B' : 'W', +pos[0] as 0 | 1))
        }
    }
    // 同盤面上の敵駒でキングを攻撃しているものがあるか
    for (const [pos, piece] of enemies.entries()) {
        if (~piece.coveringSquares(pos, board).map(e => String(e))
                .indexOf(String(targetPos.slice(1)))) {
            return true;
        }
    }
    return false;
}

export { isChecked };