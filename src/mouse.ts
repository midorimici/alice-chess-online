import { Vec } from './config';

export default class Mouse {
    private squareSize: number;
    private margin: number;

    constructor(canvas: HTMLCanvasElement) {
        this.squareSize = canvas.width*3/20;
        this.margin = canvas.width/20;
    }

    /**
     * ウィンドウ座標を取得する
     * @param e マウスイベント
     */
    getWindowPos(e: MouseEvent): [number, number] {
        const rect: DOMRect = (e.target as Element).getBoundingClientRect();
        return [e.clientX - rect.left, e.clientY - rect.top];
    }

    /**
     * ウィンドウ座標をゲーム内座標に変換する
     * @param pos ウィンドウ座標
     */
    private chcoord(pos: [number, number]): [number, number] {
        return new Vec(pos)
            .add(-this.margin).quot(this.squareSize).val();
    }

    /**
     * ゲーム内座標を取得する
     * @param e マウスイベント
     */
    getCoord(e: MouseEvent): [number, number] {
        return this.chcoord(this.getWindowPos(e));
    }

    /**
     * (x, y) が指定範囲内にあるか
     * @param x 位置
     * @param y 位置
     * @param left 左端
     * @param top 上端
     * @param w 幅
     * @param h 高さ
     */
    onArea(x: number, y: number,
            left: number, top: number, w: number, h: number): boolean {
        return left <= x && x <= left+w && top <= y&& y <= top+h;
    }
}