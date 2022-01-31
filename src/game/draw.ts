import { BOARD_MAX_INDEX, colors, scales } from '~/config';
import { Vec } from './vec';

const BOARD_SIZE = BOARD_MAX_INDEX + 1;

const ALPHA = 0.3;

const promotionCandidates: PieceName[] = ['N', 'B', 'R', 'Q'];

export default class Draw {
  private readonly canvass: HTMLCanvasElement[];
  private readonly ctxs: CanvasRenderingContext2D[];
  private readonly squareSize: number;
  private readonly margin: number;
  private readonly imgs: Map<string, HTMLImageElement> = new Map();

  /**
   * - canvas サイズ設定
   * - context 作成
   * - プロパティ定義
   */
  constructor(canvass: HTMLCanvasElement[]) {
    this.canvass = canvass;
    this.ctxs = canvass.map((e) => e.getContext('2d'));
    this.squareSize = canvass[0].width * scales.squareSize;
    this.margin = canvass[0].width * scales.margin;
  }

  /**
   * 非同期処理のためのコンストラクタ代用
   * @param canvass 2つのキャンバスの配列
   */
  static async init(canvass: HTMLCanvasElement[]) {
    const draw = new Draw(canvass);
    let pieces: [PieceColor, string][] = [];
    for (const color of ['W', 'B'] as const) {
      for (const name of 'NBRQKP') {
        pieces.push([color, name]);
      }
    }
    const imgs: any = await Promise.all(pieces.map(([color, name]) => draw.loadImg(color, name)));
    for (let i = 0; i < 12; i++) {
      draw.imgs.set(pieces[i].join(''), imgs[i]);
    }
    return draw;
  }

  /**
   * 駒の画像を読み込む
   * @param color 駒色
   * @param name 駒の名前
   */
  private loadImg(color: PieceColor, name: string) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = `../static/img/${color}${name}.png`;
    });
  }

  /**
   * 画像を描画する
   * @param ctx コンテキスト
   * @param img 描画する画像
   * @param pos 描画位置。盤面上の座標
   */
  private drawImg(ctx: CanvasRenderingContext2D, img: HTMLImageElement, pos: Vector) {
    const sqSize = this.squareSize;
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      this.margin + sqSize * pos[0],
      this.margin + sqSize * pos[1],
      sqSize,
      sqSize
    );
  }

  /**
   * 画像を描画
   * @param pos 描画する位置。'盤面,x,y'
   * @param piece 描画する駒の名前。'WB'など
   * @param showOppositePieces 反対側の盤面の駒を表示するか
   */
  private drawPiece(posStr: string, piece: string, showOppositePieces: boolean) {
    const pos = posStr.split(',').map((e) => +e);
    const anotherCtx = this.ctxs[1 - pos[0]];
    const img = this.imgs.get(piece);
    this.drawImg(this.ctxs[pos[0]], img, [pos[1], pos[2]]);
    if (showOppositePieces) {
      anotherCtx.save();
      anotherCtx.globalAlpha = 0.2;
      this.drawImg(anotherCtx, img, [pos[1], pos[2]]);
      anotherCtx.restore();
    }
  }

  /** アイボリーで画面全体を塗りつぶす */
  private clearCanvas() {
    for (let i = 0; i < 2; i++) {
      this.ctxs[i].fillStyle = colors.ivory;
      this.ctxs[i].fillRect(0, 0, this.canvass[i].width, this.canvass[i].height);
    }
  }

  /**
   * チェッカーボードを描く
   * @param ctx コンテキスト
   */
  private grid(ctx: CanvasRenderingContext2D) {
    const squareSize: number = this.squareSize;
    const coord: Vector = [this.margin, this.margin];

    // マス目を描く
    ctx.fillStyle = colors.buff;
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if ((i + j) % 2) {
          ctx.fillRect(...new Vec([i, j]).mul(squareSize).add(coord).val(), squareSize, squareSize);
        }
      }
    }

    // 線を描く
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i: number = 0; i <= BOARD_SIZE; i++) {
      ctx.moveTo(...new Vec(coord).add([0, squareSize * i]).val());
      ctx.lineTo(...new Vec(coord).add([squareSize * BOARD_SIZE, squareSize * i]).val());
    }
    for (let i: number = 0; i <= BOARD_SIZE; i++) {
      ctx.moveTo(...new Vec(coord).add([squareSize * i, 0]).val());
      ctx.lineTo(...new Vec(coord).add([squareSize * i, squareSize * BOARD_SIZE]).val());
    }
    ctx.closePath();
    ctx.stroke();
  }

  /** ゲームボードと盤面上の駒を描く
   * @param boardsmap 盤面データ
   * @param color 駒色。先手後手どちら目線か
   * @param showOppositePieces 反対側の盤面の駒を表示するか
   */
  board(boardsMap: BoardMap, color: PieceColor, showOppositePieces: boolean) {
    this.clearCanvas();
    const ctxs = this.ctxs;

    // グリッド
    for (const ctx of ctxs) {
      this.grid(ctx);

      // ファイル・ランク
      const textSize: number = this.squareSize / 3;
      ctx.fillStyle = colors.dark;
      ctx.font = `${textSize}px Meiryo`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < BOARD_SIZE; i++) {
        ctx.fillText(
          String.fromCodePoint(i + 97),
          (color === 'W' ? i + 1 : BOARD_SIZE - i) * this.squareSize,
          this.canvass[0].height - this.margin / 2
        );
        ctx.fillText(
          `${BOARD_SIZE - i}`,
          this.margin / 2,
          (color === 'W' ? i + 1 : BOARD_SIZE - i) * this.squareSize
        );
      }
    }

    // 駒
    for (let [pos, piece] of boardsMap.entries()) {
      this.drawPiece(pos, piece, showOppositePieces);
    }
  }

  /**
   * 駒の行先を円で表示する
   * @param boardId 駒のある盤面がどちらか
   * @param dests 行先の配列
   * @param isMyPiece 選択中の駒が自分の駒か
   */
  dest(boardId: BoardId, dests: Vector[], isMyPiece: boolean) {
    const ctx = this.ctxs[boardId];
    for (const dest of dests) {
      const coord = new Vec(dest)
        .mul(this.squareSize)
        .add(this.margin + this.squareSize / 2)
        .val();
      ctx.beginPath();
      ctx.arc(...coord, this.squareSize / 4, 0, 2 * Math.PI);
      ctx.fillStyle = isMyPiece ? colors.safe : colors.navy;
      ctx.fill();
    }
  }

  /**
   * プロモーションの選択肢を表示
   * @param boardId 駒の移動前の盤面がどちらか
   * @param color 表示する駒色
   */
  promotion(boardId: 0 | 1, color: PieceColor) {
    const ctx = this.ctxs[boardId];
    const margin = this.margin;
    const sqSize = this.squareSize;
    ctx.fillStyle = colors.grey;
    ctx.fillRect(margin + (sqSize * 3) / 2, margin + sqSize * 3, sqSize * 5, sqSize * 2);
    for (let i = 0; i < promotionCandidates.length; i++) {
      this.drawImg(ctx, this.imgs.get(color + promotionCandidates[i]), [2 + i, 3.5]);
    }
  }

  /**
   * 半透明の正方形を描画する
   * @param boardId どちらの盤面か
   * @param pos 描画する座標
   * @param alpha 不透明度
   */
  private transparentSquare(boardId: BoardId, pos: Vector, alpha: number) {
    const ctx = this.ctxs[boardId];
    const squareSize: number = this.squareSize;
    ctx.save();
    ctx.fillStyle = colors.safe;
    ctx.globalAlpha = alpha;
    ctx.fillRect(...this.posToCoord(pos), squareSize, squareSize);
    ctx.restore();
  }

  /**
   * Converts a position on a board to a coordinate value.
   * @param pos A position of a piece.
   * @returns A left-top coordinate of the corresponding square.
   */
  private posToCoord(pos: Vector): Vector {
    const squareSize: number = this.squareSize;
    const coord: Vector = [this.margin, this.margin];
    return new Vec(pos).mul(squareSize).add(coord).val();
  }

  /**
   * 選択中のマスに色を付ける
   * @param boardId どちらの盤面か
   * @param pos 選択中のマス
   */
  selectedSquare(boardId: BoardId, pos: Vector) {
    this.transparentSquare(boardId, pos, ALPHA);
  }

  /**
   * 選択中のプロモーション先に色を付ける
   * @param boardId どちらの盤面か
   * @param index プロモーション先が左から何番目に並んでいるか
   */
  selectedPromotionCandidate(boardId: BoardId, index: 0 | 1 | 2 | 3) {
    const pos: Vector = [index + 2, 3.5];
    this.transparentSquare(boardId, pos, ALPHA);
  }

  /**
   * 選択中の列に色を付ける
   * @param boardId どちらの盤面か
   * @param file 選択した列
   */
  selectedFile(boardId: BoardId, file: number) {
    const ctx = this.ctxs[boardId];
    for (let rank = 0; rank <= BOARD_MAX_INDEX; rank++) {
      this.transparentSquare(boardId, [file, rank], ALPHA * 3);
      this.text(ctx, `${BOARD_SIZE - rank}`, file, rank);
    }
  }

  /**
   * Draw a text on the canvas.
   * @param ctx Canvas context object to draw the text.
   * @param t The text to draw.
   * @param x The x position of the text.
   * @param y The y position of the text.
   */
  private text(ctx: CanvasRenderingContext2D, t: string, x: number, y: number) {
    ctx.save();
    ctx.font = 'bold 48px "Cica"';
    ctx.fillStyle = colors.navy;
    ctx.fillText(t, (x + 1) * this.squareSize, (y + 1) * this.squareSize);
    ctx.restore();
  }
}
