import config, { Vec } from '../config';
import * as game from './game';

export abstract class Piece {
    readonly color: 'W' | 'B';
    readonly abbr: string;
    readonly side: 0 | 1;

    /**
     * @param color 駒色
     * @param name 駒の名前 'WB' など
     * @param side 駒がどちらの盤にあるか
     */
    constructor(color: 'W' | 'B', side: 0 | 1) {
        this.color = color;
        this.side = side;
    }

    /**
     * 指定の位置が盤面内に収まっているか
     * @param pos 位置
     */
    protected inBoard(pos: [number, number]): boolean {
        return pos[0] >= 0 && pos[0] < 8 && pos[1] >= 0 && pos[1] < 8;
    }

    /**
     * 指定の位置に動かしてもよいか
     * @param pos 位置
     * @param boards 盤面
     */
    protected legal(pos: [number, number], boards: Map<string, string>): boolean {
        // 盤面内に収まる && 向こう側の盤面の対応する位置に駒がない && 行先に自分の駒がない
        return this.inBoard(pos)
            && boards.get(`${1-this.side},` + String(pos)) === undefined
            && !(boards.get(`${this.side},` + String(pos))?.[0] === this.color);
    }

    /**
     * 走り駒の行き先
     * @param pos 駒の位置
     * @param intervals 走る方向
     * @param boards 盤面
     */
    protected rider(pos: [number, number], intervals: [number, number][],
            boards: Map<string, string>): [number, number][] {
        let answers: [number, number][] = [];
        for (let [dx, dy] of intervals) {
            let xtmp = pos[0] + dx, ytmp = pos[1] + dy;
            while (this.inBoard([xtmp, ytmp])) {
                let destThis = boards.get(`${this.side},${xtmp},${ytmp}`);
                let destThat = boards.get(`${1-this.side},${xtmp},${ytmp}`);
                if (!destThat) {
                    // 向こう側の盤のマスに何もない
                    if (!destThis) {
                        // こちら側の盤のマスに何もない
                        answers.push([xtmp, ytmp]);
                    } else if (destThis[0] !== this.color) {
                        // 敵駒がある
                        answers.push([xtmp, ytmp]);
                        break;
                    } else break;
                }
                xtmp += dx;
                ytmp += dy;
            }
        }
        return answers;
    }

    /**
     * 駒が動ける位置リストを返す
     * @param pos 駒の現在位置
     * @param board 盤面
     */
    abstract coveringSquares(
        pos: [number, number], boards: Map<string, string>): [number, number][];

    /**
     * チェック回避のための制限も含めた駒が動ける位置リストを返す
     * @param pos 駒の現在位置
     * @param boards 盤面
     */
    validMoves(pos: [number, number], boards: Map<string, string>): [number, number][] {
        let result: [number, number][] = [];
        for (const dest of this.coveringSquares(pos, boards)) {
            // 盤面の複製
            const tmpBoards = new Map(boards);
            // 盤面の更新
            game.renewBoard(this.side, pos, dest, tmpBoards);
            // チェックにならないなら結果に追加
            if (!game.isChecked(this.color, tmpBoards)) {
                result.push(dest);
            }
        }
        return result;
    }
}

export class Knight extends Piece {
    abbr = 'N';

    coveringSquares(pos: [number, number], boards: Map<string, string>): [number, number][] {
        const dirList: [number, number][]
            = [[1, 2], [2, 1], [2, -1], [1, -2],
                [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
        return dirList
            .map(e => new Vec(pos).add(e).val())
            .filter((dest: [number, number]) =>
                this.legal(dest, boards));
    }
}

export class Bishop extends Piece {
    abbr = 'B';

    coveringSquares(pos: [number, number], boards: Map<string, string>): [number, number][] {
        return this.rider(pos, [[1, 1], [1, -1], [-1, -1], [-1, 1]], boards);
    }
}

export class Rook extends Piece {
    abbr = 'R';

    coveringSquares(pos: [number, number], boards: Map<string, string>): [number, number][] {
        return this.rider(pos, [[1, 0], [0, -1], [-1, 0], [0, 1]], boards);
    }
}

export class Queen extends Piece {
    abbr = 'Q';

    coveringSquares(pos: [number, number], boards: Map<string, string>): [number, number][] {
        return this.rider(pos,
            [[1, 1], [1, -1], [-1, -1], [-1, 1], [1, 0], [0, -1], [-1, 0], [0, 1]], boards);
    }
}

export class King extends Piece {
    abbr = 'K';

    coveringSquares(pos: [number, number], boards: Map<string, string>): [number, number][] {
        const dirList: [number, number][]
            = [[1, 0], [1, -1], [0, -1], [-1, -1],
                [-1, 0], [-1, 1], [0, 1], [1, 1]];
        return dirList
            .map(e => new Vec(pos).add(e).val())
            .filter((dest: [number, number]) =>
                this.legal(dest, boards));
    }
}

export class Pawn extends Piece {
    abbr = 'P';

    coveringSquares(pos: [number, number], boards: Map<string, string>): [number, number][] {
        let answers: [number, number][] = [];
        // 駒を取る動き
        var target = new Vec(pos).add([1, -1]).val();
        if (boards.get(`${this.side},` + String(target))?.[0] === config.opponent[this.color]) {
            answers.push(target);
        }
        var target = new Vec(pos).add([-1, -1]).val();
        if (boards.get(`${this.side},` + String(target))?.[0] === config.opponent[this.color]) {
            answers.push(target);
        }
        // 一歩先
        var target = new Vec(pos).add([0, -1]).val();
        if (!boards.has(`${this.side},` + String(target)) && this.legal(target, boards)) {
            answers.push(target);
        }
        // 二歩先（最初だけ）
        var target2 = new Vec(pos).add([0, -2]).val();
        if (pos[1] === 6
                && !boards.has(`${this.side},` + String(target))
                && !boards.has(`${this.side},` + String(target2))
                && this.legal(target2, boards)) {
            answers.push(target2);
        }
        return answers;
    }
}

export type pieceNames = 'N' | 'B' | 'R' | 'Q' | 'K' | 'P';

export const abbrPieceDict = {'N': Knight, 'B': Bishop, 'R': Rook, 'Q': Queen, 'K': King, 'P': Pawn};