import config, { Vec } from './config';
import { Piece } from './piece';

export default class Draw {
    private canvass: HTMLCanvasElement[];
    private ctxs: CanvasRenderingContext2D[];
    private squareSize: number;
    private margin: number;
    private imgs: Map<string, HTMLImageElement> = new Map();

    /**
     * - canvas サイズ設定
     * - context 作成
     * - プロパティ定義
     */
    constructor(canvass: HTMLCanvasElement[]) {
        this.canvass = canvass;
        this.ctxs = canvass.map(e => e.getContext('2d'));
        this.squareSize = canvass[0].width*config.squareSize;
        this.margin = canvass[0].width*config.margin;
    }

    static async init(canvass: HTMLCanvasElement[]) {
        const draw = new Draw(canvass);
        let pieces: [string, string][] = [];
        for (const color of 'WB') {
            for (const name of 'NBRQKP') {
                pieces.push([color, name]);
            }
        }
        const imgs: any = await Promise.all(pieces.map(
            ([color, name]) => draw.loadImg(color, name)));
        for (let i = 0; i < 12; i++) {
            draw.imgs.set(pieces[i].join(''), imgs[i]);
        }
        return draw;
    }

    private loadImg(color: string, name: string) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = `./static/img/${color}${name}.png`;
        });
    }

    /**
     * 画像を描画
     * @param pos 描画する位置。'盤面,x,y'
     * @param piece 描画する駒の名前。'WB'など
     */
    private drawImg(pos: string, piece: string) {
        const squareSize = this.squareSize;
        const pos_ = pos.split(',').map(e => +e);
        const img = this.imgs.get(piece);
        this.ctxs[pos_[0]].drawImage(img, 0, 0, img.width, img.height,
            this.margin + squareSize*pos_[1], this.margin + squareSize*pos_[2],
            squareSize, squareSize);
    }

    /** アイボリーで画面全体を塗りつぶす */
    private clearCanvas() {
        for (let i = 0; i < 2; i++) {
            this.ctxs[i].fillStyle = config.ivory;
            this.ctxs[i].fillRect(0, 0, this.canvass[i].width, this.canvass[i].height);
        }
    }

    /** 待機画面 */
    /*
    private waitingPlayer() {
        this.clearCanvas();
        const canvas = this.canvas;
        const ctx = this.ctx;
        const textSize: number = canvas.width/20;
        ctx.fillStyle = config.dark;
        ctx.font = `${textSize}px Meiryo`;
        ctx.fillText(this.isEN
            ? 'Waiting for the opponent...'
            : '対戦相手の入室を待っています...',
            canvas.width/2 - (7.5)*textSize,
            canvas.height/2);
    }
    */

    /**
     * 一辺 squareSize のグリッドを描く
     * @param coord 左上の座標。ウィンドウ座標
     * @param col 列数
     * @param row 行数
     */
    private grid(ctx: CanvasRenderingContext2D) {
        const squareSize: number = this.squareSize;
        const coord: [number, number] = [this.margin, this.margin];

        // マス目を描く
        ctx.fillStyle = config.buff;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i+j)%2) {
                    ctx.fillRect(...new Vec([i, j]).mul(squareSize).add(coord).val(),
                        squareSize, squareSize);
                }
            }
        }
        
        // 線を描く
        ctx.strokeStyle = config.dark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i: number = 0; i <= 8; i++) {
            ctx.moveTo(...new Vec(coord).add([0, squareSize*i]).val());
            ctx.lineTo(...new Vec(coord).add([squareSize*8, squareSize*i]).val());
        }
        for (let i: number = 0; i <= 8; i++) {
            ctx.moveTo(...new Vec(coord).add([squareSize*i, 0]).val());
            ctx.lineTo(...new Vec(coord).add([squareSize*i, squareSize*8]).val());
        }
        ctx.closePath();
        ctx.stroke();
    }

    /**
     * 駒を描く
     * @param color 駒色。rgb(R, G, B) の書式
     * @param pos 駒の位置。ゲーム内座標
     * @param rev 上下反転して表示する
     */
    /*
    private piece(color: string, pos: [number, number], rev: boolean) {
        const ctx = this.ctx;
        const coord: [number, number] = new Vec(pos).mul(this.squareSize)
            .add(this.margin + this.squareSize/2).val();
        ctx.save();
        ctx.fillStyle = color;
        ctx.translate(...coord);
        if (rev) {
            // 相手の駒は逆転して描く
            ctx.rotate(Math.PI);
        }
        ctx.fill(this.piecePath);
        ctx.restore();
    }
    */

    /**
     * ボタンを描く
     * @param coord 位置。ウィンドウ座標
     * @param size 幅と高さ
     * @param disabled 押せなくする
     */
    /*
    private button(coord: [number, number], size: [number, number],
            disabled: boolean) {
        const ctx = this.ctx;

        ctx.fillStyle = disabled ?
            'rgb(160, 140, 120)' : 'rgb(200, 180, 160)';
        ctx.fillRect(...coord, ...size);

        ctx.font = `${this.canvas.width/30}px Meiryo`;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = config.dark;
        ctx.fillText('OK',
            ...new Vec(size).div(2).add(coord).val());
        ctx.restore();
    }
    */

    /** ゲームボードと盤面上の駒を描く
     * @param boardmap 盤面データ
     * @param turn 先手後手どちら目線か
     * @param first 先手のプレイヤー名
     * @param second 後手のプレイヤー名
     * @param showAll すべての駒色を隠さず表示する
     */
    board(boardmap: Map<string, string>,
            color: 'W' | 'B', showAll: boolean = false) {
        this.clearCanvas();
        const ctxs = this.ctxs;

        // グリッド
        for (const ctx of ctxs) {
            this.grid(ctx);

            // ファイル・ランク
            const textSize: number = this.squareSize/3;
            ctx.fillStyle = config.dark;
            ctx.font = `${textSize}px Meiryo`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < 8; i++) {
                ctx.fillText(String.fromCodePoint(i+97),
                    (color === 'W' ? i+1 : 8-i)*this.squareSize, this.canvass[0].height - this.margin/2)
                ctx.fillText(`${8-i}`,
                    this.margin/2, (color === 'W' ? i+1 : 8-i)*this.squareSize);
            }
        }

        // 駒
        for (let [pos, piece] of boardmap.entries()) {
            this.drawImg(pos, piece);
        }
    }

    /**
     * 駒の行先を円で表示する
     * @param piece 駒インスタンス
     * @param pos 位置。ゲーム内座標
     * @param boardmap 盤面データ
     */
    dest(piece: Piece, pos: [number, number],
            boardmap: Map<string, string>) {
        const ctx = this.ctxs[piece.side];
        for (const dest of piece.coveringSquares(pos, boardmap)) {
            // 自分の駒の位置を除外
            if (!(boardmap.has(`${piece.side},` + String(dest))
                    && boardmap.get(`${piece.side},` + String(dest))[0]
                        === piece.color)) {
                const coord = new Vec(dest).mul(this.squareSize)
                    .add(this.margin + this.squareSize/2).val();
                ctx.beginPath();
                ctx.arc(...coord, this.squareSize/4, 0, 2*Math.PI);
                ctx.fillStyle = config.safe;
                ctx.fill();
            }
        }
    }

    /**
     * 取った駒を盤面の端に描画する
     * @param numbers それぞれが取った駒の色と数
     * @param turn 先手後手どちら目線か
     */
    /*
    takenPieces(numbers: [{'R': number, 'B': number}, {'R': number, 'B': number}],
            turn: 0 | 1) {
        const ctx = this.ctx;
        const smallPieceSize = this.pieceSize/6;
        const margin = this.margin;
        const squareSize = this.squareSize;

        const drawPiece = (coord: [number, number], color: string) => {
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(...coord);
            ctx.scale(1/6, 1/6);
            ctx.fill(this.piecePath);
            ctx.restore();
        }

        const y1 = turn === 0 ? margin + 6*squareSize + smallPieceSize : smallPieceSize;
        const y2 = turn === 1 ? margin + 6*squareSize + smallPieceSize : smallPieceSize;

        // 先手が取った駒
        for (let i = 0; i < numbers[0]['R']; i++) {
            const coord: [number, number] = [(i+1)*smallPieceSize, y1];
            drawPiece(coord, config.red);
        }
        for (let i = 0; i < numbers[0]['B']; i++) {
            const coord: [number, number] = [(i+1+numbers[0]['R'])*smallPieceSize, y1];
            drawPiece(coord, config.blue);
        }
        // 後手が取った駒
        for (let i = 0; i < numbers[1]['R']; i++) {
            const coord: [number, number] = [(i+1)*smallPieceSize, y2];
            drawPiece(coord, config.red);
        }
        for (let i = 0; i < numbers[1]['B']; i++) {
            const coord: [number, number] = [(i+1+numbers[1]['R'])*smallPieceSize, y2];
            drawPiece(coord, config.blue);
        }
    }
    */
};