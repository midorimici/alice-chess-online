import { scales } from '~/config';
import { Vec } from './vec';

export default class Mouse {
  private squareSize: number;
  private margin: number;

  constructor(canvas: HTMLCanvasElement) {
    this.squareSize = canvas.width * scales.squareSize;
    this.margin = canvas.width * scales.margin;
  }

  /**
   * キャンバス座標を取得する
   * @param e マウスイベント
   */
  private getWindowPos(e: MouseEvent): [number, number] {
    const rect: DOMRect = (e.target as Element).getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  /**
   * ウィンドウ座標をゲーム内座標に変換する
   * @param pos ウィンドウ座標
   */
  private chcoord(pos: [number, number]): [number, number] {
    return new Vec(pos).add(-this.margin).quot(this.squareSize).val();
  }

  /**
   * ゲーム内座標を取得する
   * @param e マウスイベント
   */
  getCoord(e: MouseEvent): [number, number] {
    return this.chcoord(this.getWindowPos(e));
  }
}
