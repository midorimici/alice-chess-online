import { Vec } from './config';

export default class Piece {
    color: 'R' | 'B';
    turn: 0 | 1;

    /**
     * @param color 駒色
     * @param turn 先手(0)後手(1)どちらの駒か
     */
    constructor(color: 'R' | 'B', turn: 0 | 1) {
        this.color = color;
        this.turn = turn;
    }

    /**
     * 駒が動ける位置のリストを返す
     * @param pos 駒の位置。ゲーム内座標
     */
    coveringSquares(pos: [number, number]): [number, number][] {
        const pos_: [number, number][] = [[0, 1], [0, -1], [-1, 0], [1, 0]]
            .map((e: [number, number]) => new Vec(pos).add(e).val());
        let dest: [number, number][] = pos_
            .filter(([x, y]: [number, number]) =>
                0 <= x && x <= 5 && 0 <= y && y <= 5);
        if (this.color === 'B') {
            if (String(pos) === '0,0') {
                dest.push([0, -1]);
            } else if (String(pos) === '5,0') {
                dest.push([5, -1]);
            }
        }
        return dest;
    }
}