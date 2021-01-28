export default {
    ivory: 'rgb(240, 227, 206)',
    dark: 'rgb(30, 30, 30)',
    red: 'rgb(200, 0, 0)',
    blue: 'rgb(0, 0, 200)',
    grey: 'rgb(150, 150, 150)',
    safe: 'rgb(121, 202, 68)'
};

/**
 * @classdesc 二次元ベクトルの計算を補助する
 */
export class Vec {
    private v: [number, number];

    /**
     * @param v 二数の配列
     */
    constructor(v: [number, number]) {
        this.v = v;
    }

    /**
     * Vec インスタンスから二数の配列を返す
     */
    val(): [number, number] {
        return this.v;
    }

    /**
     * ベクトルに加算する
     * @param v 加算する数またはベクトル
     */
    add(v: number | [number, number]): Vec {
        if (Array.isArray(v)) {
            return new Vec([v[0] + this.v[0], v[1] + this.v[1]]);
        } else {
            return new Vec([v + this.v[0], v + this.v[1]]);
        }
    }

    /**
     * ベクトルに乗算する
     * @param n 乗ずる数
     */
    mul(n: number): Vec {
        return new Vec([n*this.v[0], n*this.v[1]]);
    }

    /**
     * ベクトルに除算する
     * @param n 除する数
     */
    div(n: number): Vec {
        return new Vec([this.v[0]/n, this.v[1]/n]);
    }

    /**
     * ベクトルに除算した商を返す
     * @param n 除する数
     */
    quot(n: number): Vec {
        return new Vec([Math.floor(this.v[0]/n), Math.floor(this.v[1]/n)]);
    }
}