import { Vec } from './vec';
import * as game from './game';

abstract class Piece {
  readonly color: 'W' | 'B';
  readonly abbr: PieceName;
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
    return (
      this.inBoard(pos) &&
      boards.get(`${1 - this.side},` + String(pos)) === undefined &&
      !(boards.get(`${this.side},` + String(pos))?.[0] === this.color)
    );
  }

  /**
   * 走り駒の行き先
   * @param pos 駒の位置
   * @param intervals 走る方向
   * @param boards 盤面
   */
  protected rider(
    pos: [number, number],
    intervals: [number, number][],
    boards: Map<string, string>
  ): [number, number][] {
    let answers: [number, number][] = [];
    for (let [dx, dy] of intervals) {
      let xtmp = pos[0] + dx,
        ytmp = pos[1] + dy;
      while (this.inBoard([xtmp, ytmp])) {
        let destThis = boards.get(`${this.side},${xtmp},${ytmp}`);
        let destThat = boards.get(`${1 - this.side},${xtmp},${ytmp}`);
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
   * 駒が単独で動ける位置リストを返す
   * @param pos 駒の現在位置
   * @param board 盤面
   */
  abstract coveringSquares(pos: [number, number], boards: Map<string, string>): [number, number][];

  /**
   * ゲーム内で駒が動ける位置リストを返す
   * @param pos 駒の現在位置
   * @param boards 盤面
   * @param advanced2Pos ポーンが 2 歩進んだときの移動先
   * @param canCastle キャスリングのポテンシャルが残っているか
   */
  validMoves(
    pos: [number, number],
    boards: Map<string, string>,
    advanced2Pos: number[] | null,
    canCastle: { W: [boolean, boolean]; B: [boolean, boolean] }
  ): [number, number][] {
    let result: [number, number][] = [];
    let dests = this.coveringSquares(pos, boards);

    // キャスリング
    if (this.abbr === 'K') {
      for (const i of [0, 1] as [0, 1]) {
        const endPos: [number, number] =
          this.color === 'W' ? (i === 0 ? [2, 7] : [6, 7]) : i === 0 ? [5, 7] : [1, 7];
        if (game.castlingReq(canCastle, this.color, i, this.side, endPos, boards)) {
          dests.push(endPos);
        }
      }
    }

    // en passant
    if (advanced2Pos) {
      const endPos: [number, number] = [7 - advanced2Pos[1], 7 - advanced2Pos[2] - 1];
      if (game.enPassantReq(pos, endPos, this.abbr, this.side, advanced2Pos[0] as 0 | 1, boards)) {
        dests.push(endPos);
      }
    }

    // チェック回避のための制限
    for (const dest of dests) {
      // 盤面の複製
      const tmpBoards = new Map(boards);
      // 盤面の更新
      if (this.abbr === 'K') {
        // 動かす駒がキングのとき
        // その盤面上で合法である（敵の効きに移動していない）
        const tmpBoards2 = new Map(boards);
        tmpBoards2.set(`${this.side},` + String(dest), this.color + 'K');
        tmpBoards2.delete(`${this.side},` + String(pos));
        if (game.isChecked(this.color, game.rotateBoard(tmpBoards2))) continue;
        // 向こうの盤面のその位置も敵の効きでない
      }
      game.renewBoard(this.side, pos, dest, tmpBoards);
      // チェックにならないなら結果に追加
      if (!game.isChecked(this.color, game.rotateBoard(tmpBoards))) {
        result.push(dest);
      }
    }
    return result;
  }
}

class Knight extends Piece {
  abbr: PieceName = 'N';

  coveringSquares(pos: [number, number], boards: Map<string, string>): [number, number][] {
    const dirList: [number, number][] = [
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
      [-1, -2],
      [-2, -1],
      [-2, 1],
      [-1, 2],
    ];
    return dirList
      .map((e) => new Vec(pos).add(e).val())
      .filter((dest: [number, number]) => this.legal(dest, boards));
  }
}

class Bishop extends Piece {
  abbr: PieceName = 'B';

  coveringSquares(pos: [number, number], boards: Map<string, string>): [number, number][] {
    return this.rider(
      pos,
      [
        [1, 1],
        [1, -1],
        [-1, -1],
        [-1, 1],
      ],
      boards
    );
  }
}

class Rook extends Piece {
  abbr: PieceName = 'R';

  coveringSquares(pos: [number, number], boards: Map<string, string>): [number, number][] {
    return this.rider(
      pos,
      [
        [1, 0],
        [0, -1],
        [-1, 0],
        [0, 1],
      ],
      boards
    );
  }
}

class Queen extends Piece {
  abbr: PieceName = 'Q';

  coveringSquares(pos: [number, number], boards: Map<string, string>): [number, number][] {
    return this.rider(
      pos,
      [
        [1, 1],
        [1, -1],
        [-1, -1],
        [-1, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
        [0, 1],
      ],
      boards
    );
  }
}

class King extends Piece {
  abbr: PieceName = 'K';

  coveringSquares(pos: [number, number], boards: Map<string, string>): [number, number][] {
    const dirList: [number, number][] = [
      [1, 0],
      [1, -1],
      [0, -1],
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ];
    return dirList
      .map((e) => new Vec(pos).add(e).val())
      .filter((dest: [number, number]) => this.legal(dest, boards));
  }
}

class Pawn extends Piece {
  abbr: PieceName = 'P';

  coveringSquares(pos: [number, number], boards: Map<string, string>): [number, number][] {
    let answers: [number, number][] = [];
    // 駒を取る動き
    var target = new Vec(pos).add([1, -1]).val();
    if (boards.get(`${this.side},` + String(target))?.[0] === game.opponent[this.color]) {
      answers.push(target);
    }
    var target = new Vec(pos).add([-1, -1]).val();
    if (boards.get(`${this.side},` + String(target))?.[0] === game.opponent[this.color]) {
      answers.push(target);
    }
    // 一歩先
    var target = new Vec(pos).add([0, -1]).val();
    if (!boards.has(`${this.side},` + String(target)) && this.legal(target, boards)) {
      answers.push(target);
    }
    // 二歩先（最初だけ）
    var target2 = new Vec(pos).add([0, -2]).val();
    if (
      pos[1] === 6 &&
      !boards.has(`${this.side},` + String(target)) &&
      !boards.has(`${this.side},` + String(target2)) &&
      this.legal(target2, boards)
    ) {
      answers.push(target2);
    }
    return answers;
  }
}

const abbrPieceDict = { N: Knight, B: Bishop, R: Rook, Q: Queen, K: King, P: Pawn };

export { Piece, Knight, Bishop, Rook, Queen, King, Pawn, abbrPieceDict };
