import { Vec } from './config';

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
     * @param board 盤面
     */
    protected legal(pos: [number, number], board: Map<string, string>): boolean {
        // 盤面内に収まる && 向こう側の盤面の対応する位置に駒がない
        return this.inBoard(pos)
            && board.get(`${1-this.side},${pos[0]},${pos[1]}`) === undefined;
    }

    /**
     * 走り駒の行き先
     * @param pos 駒の位置
     * @param intervals 走る方向
     * @param board 盤面
     */
    protected rider(pos: [number, number], intervals: [number, number][],
            board: Map<string, string>): [number, number][] {
        let answers: [number, number][] = [];
        for (let [dx, dy] of intervals) {
            let xtmp = pos[0] + dx, ytmp = pos[1] + dy;
            while (this.inBoard([xtmp, ytmp])) {
                let destThis = board.get(`${this.side},${xtmp},${ytmp}`);
                let destThat = board.get(`${1-this.side},${xtmp},${ytmp}`);
                if (!destThis && !destThat) {
                    answers.push([xtmp, ytmp]);
                } else if (destThis) {
                    break;
                }
                xtmp += dx;
                ytmp += dy;
            }
        }
        return answers;
    }

    abstract coveringSquares(pos: [number, number], board: Map<string, string>): [number, number][];
}

export class Knight extends Piece {
    abbr = 'N';

    /**
     * 駒が動ける位置リストを返す
     * @param pos 駒の現在位置
     * @param board 盤面
     */
    coveringSquares(pos: [number, number], board: Map<string, string>): [number, number][] {
        const dirList: [number, number][]
            = [[1, 2], [2, 1], [2, -1], [1, -2],
                [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
        return dirList
            .map(e => new Vec(pos).add(e).val())
            .filter((dest: [number, number]) =>
                this.legal(dest, board));
    }
}

export class Bishop extends Piece {
    abbr = 'B';

    coveringSquares(pos: [number, number], board: Map<string, string>): [number, number][] {
        return this.rider(pos, [[1, 1], [1, -1], [-1, -1], [-1, 1]], board);
    }
}

export class Rook extends Piece {
    abbr = 'R';

    coveringSquares(pos: [number, number], board: Map<string, string>): [number, number][] {
        return this.rider(pos, [[1, 0], [0, -1], [-1, 0], [0, 1]], board);
    }
}

export class Queen extends Piece {
    abbr = 'Q';

    coveringSquares(pos: [number, number], board: Map<string, string>): [number, number][] {
        return this.rider(pos,
            [[1, 1], [1, -1], [-1, -1], [-1, 1], [1, 0], [0, -1], [-1, 0], [0, 1]], board);
    }
}

export class King extends Piece {
    abbr = 'K';

    coveringSquares(pos: [number, number], board: Map<string, string>): [number, number][] {
        const dirList: [number, number][]
            = [[1, 0], [1, -1], [0, -1], [-1, -1],
                [-1, 0], [-1, 1], [0, 1], [1, 1]];
        return dirList
            .map(e => new Vec(pos).add(e).val())
            .filter((dest: [number, number]) =>
                this.legal(dest, board));
    }
}

export class Pawn extends Piece {
    abbr = 'P';

    coveringSquares(pos: [number, number], board: Map<string, string>): [number, number][] {
        const dir: -1 | 1 = this.color === 'W' ? -1 : 1;
        let answers: [number, number][] = [];
        // 駒を取る動き
        var target = new Vec(pos).add([1, dir]).val();
        if (board.has(`${this.side},` + String(target))) {
            answers.push(target);
        }
        var target = new Vec(pos).add([-1, dir]).val();
        if (board.has(`${this.side},` + String(target))) {
            answers.push(target);
        }
        // 一歩先
        var target = new Vec(pos).add([0, dir]).val();
        if (!board.has(`${this.side},` + String(target)) && this.legal(target, board)) {
            answers.push(target);
        }
        // 二歩先（最初だけ）
        var target2 = new Vec(pos).add([0, 2*dir]).val();
        if (pos[1] === (this.color === 'W' ? 6 : 1)
                && !board.has(`${this.side},` + String(target))
                && !board.has(`${this.side},` + String(target2))
                && this.legal(target2, board)) {
            answers.push(target2);
        }
        return answers;
    }
}

export const abbrPieceDict = {'N': Knight, 'B': Bishop, 'R': Rook, 'Q': Queen, 'K': King, 'P': Pawn};