/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/client.ts":
/*!***********************!*\
  !*** ./src/client.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _draw__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./draw */ \"./src/draw.ts\");\nvar __values = (undefined && undefined.__values) || function(o) {\n    var s = typeof Symbol === \"function\" && Symbol.iterator, m = s && o[s], i = 0;\n    if (m) return m.call(o);\n    if (o && typeof o.length === \"number\") return {\n        next: function () {\n            if (o && i >= o.length) o = void 0;\n            return { value: o && o[i++], done: !o };\n        }\n    };\n    throw new TypeError(s ? \"Object is not iterable.\" : \"Symbol.iterator is not defined.\");\n};\n\n/** 言語が英語である */\nvar isEN = location.pathname === '/en/';\n// 入室～対戦相手待機\nvar draw;\n/** initCanvas を実行済か */\nvar doneInitCanvas = false;\n/** canvas 要素 */\nvar canvass = Array.from(document.getElementsByClassName('canvas'));\n/** canvas 横のメッセージ */\nvar gameMessage = document.getElementById('game-message');\n/** ミュートボタン */\nvar muteButton = document.getElementById('mute-icon');\n/** ミュート状態か */\nvar muted = true;\n/** 入力フォームを非表示にし、canvas などを表示する */\nvar initCanvas = function () {\n    var e_1, _a;\n    document.getElementById('settings').style.display = 'none';\n    var cw = document.documentElement.clientWidth;\n    var ch = document.documentElement.clientHeight;\n    if (cw < ch || ch < 720) {\n        document.getElementById('logo').style.display = 'none';\n        document.getElementById('info-icon').style.display = 'none';\n        document.getElementsByTagName('footer')[0].style.display = 'none';\n    }\n    var max = cw < ch ? ch : cw;\n    var cvsize = (0.4 * max).toString();\n    try {\n        for (var canvass_1 = __values(canvass), canvass_1_1 = canvass_1.next(); !canvass_1_1.done; canvass_1_1 = canvass_1.next()) {\n            var canvas = canvass_1_1.value;\n            canvas.setAttribute('width', cvsize);\n            canvas.setAttribute('height', cvsize);\n        }\n    }\n    catch (e_1_1) { e_1 = { error: e_1_1 }; }\n    finally {\n        try {\n            if (canvass_1_1 && !canvass_1_1.done && (_a = canvass_1.return)) _a.call(canvass_1);\n        }\n        finally { if (e_1) throw e_1.error; }\n    }\n    draw = new _draw__WEBPACK_IMPORTED_MODULE_0__.default(canvass, isEN);\n    doneInitCanvas = true;\n    document.getElementById('game-container').style.display = 'flex';\n};\n/** 対戦者か観戦者か */\nvar myrole;\n/** 自分のユーザ名 */\nvar myname;\n// フォーム取得\n// production: https://geister-online.herokuapp.com\nvar socket = io();\nvar form = document.getElementById('form');\nform.addEventListener('submit', function (e) {\n    e.preventDefault();\n    var data = new FormData(form);\n    var info = {\n        roomId: data.get('room'),\n        role: data.get('role'),\n        name: data.get('username') === ''\n            ? (isEN ? 'anonymous' : '名無し')\n            : data.get('username'),\n    };\n    myrole = info.role;\n    myname = info.name;\n    socket.emit('enter room', info);\n}, false);\n// 部屋がいっぱいだったとき\nsocket.on('room full', /** @param id 部屋番号 */ function (id) {\n    var p = document.getElementById('message');\n    p.innerText = isEN\n        ? \"The room \" + id + \" is full. You cannot join in as a player.\"\n        : \"\\u30EB\\u30FC\\u30E0 \" + id + \" \\u306F\\u3044\\u3063\\u3071\\u3044\\u3067\\u3059\\u3002\\u5BFE\\u6226\\u8005\\u3068\\u3057\\u3066\\u53C2\\u52A0\\u3059\\u308B\\u3053\\u3068\\u306F\\u3067\\u304D\\u307E\\u305B\\u3093\\u3002\";\n});\n// 空室を観戦しようとしたとき\nsocket.on('no room', /** @param id 部屋番号 */ function (id) {\n    var p = document.getElementById('message');\n    p.innerText = isEN\n        ? \"No player is present in the room \" + id + \".\"\n        : \"\\u30EB\\u30FC\\u30E0 \" + id + \" \\u3067\\u306F\\u5BFE\\u6226\\u304C\\u884C\\u308F\\u308C\\u3066\\u3044\\u307E\\u305B\\u3093\\u3002\";\n});\n// 対戦相手を待っているとき\nsocket.on('wait opponent', function () {\n    if (!doneInitCanvas) {\n        initCanvas();\n    }\n    ;\n    gameMessage.innerText = isEN\n        ? 'Waiting for the opponent...'\n        : '対戦相手の入室を待っています...';\n});\nvar mouse;\n/**\n * 音声を再生する\n * @param file ファイル名。拡張子除く\n */\nvar snd = function (file) {\n    new Audio(\"../static/sounds/\" + file + \".wav\").play();\n};\n// ゲーム進行\n// 対戦者の処理\nsocket.on('game', \n/**\n * 対戦者側のゲーム処理\n * @param board 盤面データ\n * @param turn 自分が先手か後手か\n * @param myturn 現在自分のターンか\n * @param first 先手のプレイヤー名\n * @param second 後手のプレイヤー名\n * @param takenPieces それぞれが取った駒の色と数\n */\nfunction (board, turn, myturn, first, second, takenPieces) {\n    var e_2, _a;\n    var boardmap = new Map(board);\n    /** 選択中の駒の位置 */\n    var selectingPos;\n    // 対戦者名表示\n    if (document.getElementById('user-names').innerText === '') {\n        var opponent = turn === 0 ? second : first;\n        document.getElementById('user-names').innerText\n            = \"\\u2191 \" + opponent + \"\\n\\u2193 \" + myname;\n    }\n    // 盤面描画\n    if (!doneInitCanvas) {\n        initCanvas();\n    }\n    ;\n    draw.board(boardmap, turn);\n    //draw.takenPieces(takenPieces, turn);\n    // 手番の表示\n    if (myturn) {\n        gameMessage.innerText = isEN ? \"It's your turn.\" : 'あなたの番です。';\n        if (!muted)\n            snd('move');\n        /*\n        for (const canvas of canvass) {\n            mouse = new Mouse(canvas);\n            canvas.onclick = (e: MouseEvent) => {\n                const sqPos = mouse.getCoord(e);\n                if (boardmap.has(String(sqPos))\n                        && boardmap.get(String(sqPos)).turn === turn) {\n                    // 自分の駒を選択したとき\n                    selectingPos = sqPos;\n                    const pieceData = Object.values(\n                        boardmap.get(String(sqPos))) as ['R' | 'B', 0 | 1];\n                    const piece = new Piece(...pieceData);\n                    // 行先を描画\n                    draw.board(boardmap, turn);\n                    //draw.dest(piece, selectingPos, boardmap);\n                    //draw.takenPieces(takenPieces, turn);\n                } else {\n                    if (boardmap.has(String(selectingPos))) {\n                        const pieceData = Object.values(\n                            boardmap.get(String(selectingPos))) as ['R' | 'B', 0 | 1];\n                        const piece = new Piece(...pieceData);\n                        if (piece.coveringSquares(selectingPos).some(e =>\n                                String(e) === String(sqPos))) {\n                            // 行先を選択したとき\n                            // 駒の移動\n                            boardmap.set(String(sqPos), boardmap.get(String(selectingPos)));\n                            boardmap.delete(String(selectingPos));\n                            if (!muted) snd('move');\n                            // サーバへ移動データを渡す\n                            socket.emit('move piece', turn, selectingPos, sqPos);\n                        }\n                    }\n                    // 盤面描画更新\n                    draw.board(boardmap, turn);\n                    //draw.takenPieces(takenPieces, turn);\n                    selectingPos = null;\n                }\n            }\n        }\n        */\n    }\n    else {\n        gameMessage.innerText = isEN ? \"It's your opponent's turn.\" : '相手の番です。';\n        try {\n            for (var canvass_2 = __values(canvass), canvass_2_1 = canvass_2.next(); !canvass_2_1.done; canvass_2_1 = canvass_2.next()) {\n                var canvas = canvass_2_1.value;\n                canvas.onclick = function () { };\n            }\n        }\n        catch (e_2_1) { e_2 = { error: e_2_1 }; }\n        finally {\n            try {\n                if (canvass_2_1 && !canvass_2_1.done && (_a = canvass_2.return)) _a.call(canvass_2);\n            }\n            finally { if (e_2) throw e_2.error; }\n        }\n    }\n});\n// 観戦者の処理\nsocket.on('watch', \n/**\n * 観戦者側のゲーム処理\n * @param board 盤面データ\n * @param first 先手のプレイヤー名\n * @param second 後手のプレイヤー名\n * @param turn 現在のターン\n * @param takenPieces それぞれが取った駒の色と数\n */\nfunction (board, first, second, turn, takenPieces) {\n    if (myrole === 'watch') {\n        if (!doneInitCanvas) {\n            initCanvas();\n        }\n        ;\n        var boardmap = new Map(board);\n        draw.board(boardmap, 0, true);\n        //draw.takenPieces(takenPieces, 0);\n        var curPlayer = turn === 0 ? first : second;\n        gameMessage.innerText = isEN\n            ? \"It's \" + curPlayer + \"'s turn.\"\n            : curPlayer + \" \\u3055\\u3093\\u306E\\u756A\\u3067\\u3059\\u3002\";\n        if (!muted)\n            snd('move');\n    }\n});\n// 勝者が決まったとき\nsocket.on('tell winner', \n/** 勝者が決まったときの処理\n * @param winner 勝者のプレイヤー名\n*/\nfunction (winner) {\n    gameMessage.innerText = isEN ? winner + \" won!\" : winner + \" \\u306E\\u52DD\\u3061\\uFF01\";\n    if (!muted)\n        snd('win');\n});\n// 接続が切れたとき\nsocket.on('player discon', \n/** @param name 接続が切れたプレイヤー名 */ function (name) {\n    alert(isEN\n        ? name + \"'s connection is closed.\"\n        : name + \" \\u3055\\u3093\\u306E\\u63A5\\u7D9A\\u304C\\u5207\\u308C\\u307E\\u3057\\u305F\\u3002\");\n    location.reload();\n});\n// ミュートボタン\nmuteButton.onclick = function () {\n    muteButton.src = muted\n        ? '../static/svg/volume-up-solid.svg'\n        : '../static/svg/volume-mute-solid.svg';\n    muteButton.title = muted\n        ? (isEN ? 'Mute' : 'ミュート')\n        : (isEN ? 'Unmute' : 'ミュート解除');\n    muted = !muted;\n};\n// チャット\nvar chatForm = document.getElementById('chat-form');\nvar chatInput = document.getElementById('chat-input');\nvar chatSendButton = document.getElementById('chat-send-icon');\nchatForm.addEventListener('submit', function (e) {\n    e.preventDefault();\n    if (chatInput.value) {\n        socket.emit('chat message', chatInput.value);\n        chatInput.value = '';\n    }\n});\nchatSendButton.onclick = function () {\n    if (chatInput.value) {\n        socket.emit('chat message', chatInput.value);\n        chatInput.value = '';\n    }\n};\nvar ul = document.getElementById('chat-messages');\nsocket.on('chat message', \n/**\n * チャット受信の処理\n * @param msg 入力されたメッセージ\n * @param isPlayer 入力した人が対戦者か\n * @param name 入力した人の名前\n */\nfunction (msg, isPlayer, name) {\n    var item = document.createElement('li');\n    var nameSpan = document.createElement('span');\n    nameSpan.className = 'chat-name';\n    nameSpan.innerText = name;\n    if (isPlayer) {\n        var icon = document.createElement('img');\n        icon.className = 'chat-player-icon';\n        icon.src = '../static/svg/ghost-solid.svg';\n        icon.alt = 'player-icon';\n        icon.title = isEN ? 'Player' : '対戦者';\n        nameSpan.appendChild(icon);\n    }\n    item.appendChild(nameSpan);\n    var msgSpan = document.createElement('span');\n    msgSpan.innerText = msg;\n    item.appendChild(msgSpan);\n    ul.appendChild(item);\n    ul.scrollTop = ul.scrollHeight;\n});\n// info ボタン\nvar infoBtn = document.getElementById('info-icon');\ninfoBtn.onclick = function () {\n    document.getElementById('info-overlay').style.display = 'flex';\n};\nvar infoCloseBtn = document.getElementById('close-icon');\ninfoCloseBtn.onclick = function () {\n    document.getElementById('info-overlay').style.display = 'none';\n};\n\n\n//# sourceURL=webpack://alice-chess-online/./src/client.ts?");

/***/ }),

/***/ "./src/config.ts":
/*!***********************!*\
  !*** ./src/config.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => __WEBPACK_DEFAULT_EXPORT__,\n/* harmony export */   \"Vec\": () => /* binding */ Vec\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({\n    ivory: 'rgb(240, 227, 206)',\n    buff: 'rgb(179, 147, 105)',\n    dark: 'rgb(30, 30, 30)',\n    red: 'rgb(200, 0, 0)',\n    blue: 'rgb(0, 0, 200)',\n    grey: 'rgb(150, 150, 150)',\n    safe: 'rgb(121, 202, 68)'\n});\n/**\n * @classdesc 二次元ベクトルの計算を補助する\n */\nvar Vec = /** @class */ (function () {\n    /**\n     * @param v 二数の配列\n     */\n    function Vec(v) {\n        this.v = v;\n    }\n    /**\n     * Vec インスタンスから二数の配列を返す\n     */\n    Vec.prototype.val = function () {\n        return this.v;\n    };\n    /**\n     * ベクトルに加算する\n     * @param v 加算する数またはベクトル\n     */\n    Vec.prototype.add = function (v) {\n        if (Array.isArray(v)) {\n            return new Vec([v[0] + this.v[0], v[1] + this.v[1]]);\n        }\n        else {\n            return new Vec([v + this.v[0], v + this.v[1]]);\n        }\n    };\n    /**\n     * ベクトルに乗算する\n     * @param n 乗ずる数\n     */\n    Vec.prototype.mul = function (n) {\n        return new Vec([n * this.v[0], n * this.v[1]]);\n    };\n    /**\n     * ベクトルに除算する\n     * @param n 除する数\n     */\n    Vec.prototype.div = function (n) {\n        return new Vec([this.v[0] / n, this.v[1] / n]);\n    };\n    /**\n     * ベクトルに除算した商を返す\n     * @param n 除する数\n     */\n    Vec.prototype.quot = function (n) {\n        return new Vec([Math.floor(this.v[0] / n), Math.floor(this.v[1] / n)]);\n    };\n    return Vec;\n}());\n\n\n\n//# sourceURL=webpack://alice-chess-online/./src/config.ts?");

/***/ }),

/***/ "./src/draw.ts":
/*!*********************!*\
  !*** ./src/draw.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => __WEBPACK_DEFAULT_EXPORT__\n/* harmony export */ });\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ \"./src/config.ts\");\nvar __read = (undefined && undefined.__read) || function (o, n) {\n    var m = typeof Symbol === \"function\" && o[Symbol.iterator];\n    if (!m) return o;\n    var i = m.call(o), r, ar = [], e;\n    try {\n        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);\n    }\n    catch (error) { e = { error: error }; }\n    finally {\n        try {\n            if (r && !r.done && (m = i[\"return\"])) m.call(i);\n        }\n        finally { if (e) throw e.error; }\n    }\n    return ar;\n};\nvar __spread = (undefined && undefined.__spread) || function () {\n    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));\n    return ar;\n};\nvar __values = (undefined && undefined.__values) || function(o) {\n    var s = typeof Symbol === \"function\" && Symbol.iterator, m = s && o[s], i = 0;\n    if (m) return m.call(o);\n    if (o && typeof o.length === \"number\") return {\n        next: function () {\n            if (o && i >= o.length) o = void 0;\n            return { value: o && o[i++], done: !o };\n        }\n    };\n    throw new TypeError(s ? \"Object is not iterable.\" : \"Symbol.iterator is not defined.\");\n};\n\nvar Draw = /** @class */ (function () {\n    /**\n     * - canvas サイズ設定\n     * - context 作成\n     * - プロパティ定義\n     * - 駒、矢印のパス定義\n     * @param canvas canvas 要素\n     */\n    function Draw(canvass, isEN) {\n        this.canvass = canvass;\n        this.isEN = isEN;\n        this.ctxs = canvass.map(function (e) { return e.getContext('2d'); });\n        this.squareSize = canvass[0].width * 9 / 80;\n        this.margin = canvass[0].width / 20;\n        this.pieceSize = canvass[0].width / 10;\n        this.piecePath = new Path2D();\n        this.piecePath.moveTo(0, -this.pieceSize / 2);\n        this.piecePath.lineTo(-this.pieceSize / 2, this.pieceSize / 2);\n        this.piecePath.lineTo(this.pieceSize / 2, this.pieceSize / 2);\n        this.piecePath.closePath();\n    }\n    /**\n     * 画像読み込み&描画\n     * @param pos 描画する位置。'盤面,x,y'\n     * @param piece 描画する駒の名前。'WB'など\n     */\n    Draw.prototype.drawImg = function (pos, piece) {\n        var _this = this;\n        var squareSize = this.squareSize;\n        var pos_ = pos.split(',').map(function (e) { return +e; });\n        var img = new Image();\n        img.src = \"./static/img/\" + piece + \".png\";\n        img.onload = function () {\n            _this.ctxs[pos_[0]].drawImage(img, 0, 0, img.width, img.height, _this.margin + squareSize * pos_[1], _this.margin + squareSize * pos_[2], squareSize, squareSize);\n        };\n    };\n    /** アイボリーで画面全体を塗りつぶす */\n    Draw.prototype.clearCanvas = function () {\n        for (var i = 0; i < 2; i++) {\n            this.ctxs[i].fillStyle = _config__WEBPACK_IMPORTED_MODULE_0__.default.ivory;\n            this.ctxs[i].fillRect(0, 0, this.canvass[i].width, this.canvass[i].height);\n        }\n    };\n    /** 待機画面 */\n    /*\n    private waitingPlayer() {\n        this.clearCanvas();\n        const canvas = this.canvas;\n        const ctx = this.ctx;\n        const textSize: number = canvas.width/20;\n        ctx.fillStyle = config.dark;\n        ctx.font = `${textSize}px Meiryo`;\n        ctx.fillText(this.isEN\n            ? 'Waiting for the opponent...'\n            : '対戦相手の入室を待っています...',\n            canvas.width/2 - (7.5)*textSize,\n            canvas.height/2);\n    }\n    */\n    /**\n     * 一辺 squareSize のグリッドを描く\n     * @param coord 左上の座標。ウィンドウ座標\n     * @param col 列数\n     * @param row 行数\n     */\n    Draw.prototype.grid = function (ctx) {\n        var squareSize = this.squareSize;\n        var coord = [this.margin, this.margin];\n        // マス目を描く\n        ctx.fillStyle = _config__WEBPACK_IMPORTED_MODULE_0__.default.buff;\n        for (var i = 0; i < 8; i++) {\n            for (var j = 0; j < 8; j++) {\n                if ((i + j) % 2) {\n                    ctx.fillRect.apply(ctx, __spread(new _config__WEBPACK_IMPORTED_MODULE_0__.Vec([i, j]).mul(squareSize).add(coord).val(), [squareSize, squareSize]));\n                }\n            }\n        }\n        // 線を描く\n        ctx.strokeStyle = _config__WEBPACK_IMPORTED_MODULE_0__.default.dark;\n        ctx.lineWidth = 2;\n        ctx.beginPath();\n        for (var i = 0; i <= 8; i++) {\n            ctx.moveTo.apply(ctx, __spread(new _config__WEBPACK_IMPORTED_MODULE_0__.Vec(coord).add([0, squareSize * i]).val()));\n            ctx.lineTo.apply(ctx, __spread(new _config__WEBPACK_IMPORTED_MODULE_0__.Vec(coord).add([squareSize * 8, squareSize * i]).val()));\n        }\n        for (var i = 0; i <= 8; i++) {\n            ctx.moveTo.apply(ctx, __spread(new _config__WEBPACK_IMPORTED_MODULE_0__.Vec(coord).add([squareSize * i, 0]).val()));\n            ctx.lineTo.apply(ctx, __spread(new _config__WEBPACK_IMPORTED_MODULE_0__.Vec(coord).add([squareSize * i, squareSize * 8]).val()));\n        }\n        ctx.closePath();\n        ctx.stroke();\n    };\n    /**\n     * 駒を描く\n     * @param color 駒色。rgb(R, G, B) の書式\n     * @param pos 駒の位置。ゲーム内座標\n     * @param rev 上下反転して表示する\n     */\n    /*\n    private piece(color: string, pos: [number, number], rev: boolean) {\n        const ctx = this.ctx;\n        const coord: [number, number] = new Vec(pos).mul(this.squareSize)\n            .add(this.margin + this.squareSize/2).val();\n        ctx.save();\n        ctx.fillStyle = color;\n        ctx.translate(...coord);\n        if (rev) {\n            // 相手の駒は逆転して描く\n            ctx.rotate(Math.PI);\n        }\n        ctx.fill(this.piecePath);\n        ctx.restore();\n    }\n    */\n    /**\n     * ボタンを描く\n     * @param coord 位置。ウィンドウ座標\n     * @param size 幅と高さ\n     * @param disabled 押せなくする\n     */\n    /*\n    private button(coord: [number, number], size: [number, number],\n            disabled: boolean) {\n        const ctx = this.ctx;\n\n        ctx.fillStyle = disabled ?\n            'rgb(160, 140, 120)' : 'rgb(200, 180, 160)';\n        ctx.fillRect(...coord, ...size);\n\n        ctx.font = `${this.canvas.width/30}px Meiryo`;\n        ctx.save();\n        ctx.textAlign = 'center';\n        ctx.textBaseline = 'middle';\n        ctx.fillStyle = config.dark;\n        ctx.fillText('OK',\n            ...new Vec(size).div(2).add(coord).val());\n        ctx.restore();\n    }\n    */\n    /** ゲームボードと盤面上の駒を描く\n     * @param boardmap 盤面データ\n     * @param turn 先手後手どちら目線か\n     * @param first 先手のプレイヤー名\n     * @param second 後手のプレイヤー名\n     * @param showAll すべての駒色を隠さず表示する\n     */\n    Draw.prototype.board = function (boardmap, turn, showAll) {\n        var e_1, _a, e_2, _b;\n        if (showAll === void 0) { showAll = false; }\n        this.clearCanvas();\n        var ctxs = this.ctxs;\n        try {\n            // グリッド\n            for (var ctxs_1 = __values(ctxs), ctxs_1_1 = ctxs_1.next(); !ctxs_1_1.done; ctxs_1_1 = ctxs_1.next()) {\n                var ctx = ctxs_1_1.value;\n                this.grid(ctx);\n                // ファイル・ランク\n                var textSize = this.squareSize / 3;\n                ctx.fillStyle = _config__WEBPACK_IMPORTED_MODULE_0__.default.dark;\n                ctx.font = textSize + \"px Meiryo\";\n                ctx.textAlign = 'center';\n                ctx.textBaseline = 'middle';\n                for (var i = 0; i < 8; i++) {\n                    ctx.fillText(String.fromCodePoint(i + 97), (turn === 0 ? i + 1 : 8 - i) * this.squareSize, this.canvass[0].height - this.margin / 2);\n                    ctx.fillText(\"\" + (8 - i), this.margin / 2, (turn === 0 ? i + 1 : 8 - i) * this.squareSize);\n                }\n            }\n        }\n        catch (e_1_1) { e_1 = { error: e_1_1 }; }\n        finally {\n            try {\n                if (ctxs_1_1 && !ctxs_1_1.done && (_a = ctxs_1.return)) _a.call(ctxs_1);\n            }\n            finally { if (e_1) throw e_1.error; }\n        }\n        try {\n            // 駒\n            for (var _c = __values(boardmap.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {\n                var _e = __read(_d.value, 2), pos = _e[0], piece = _e[1];\n                this.drawImg(pos, piece);\n            }\n        }\n        catch (e_2_1) { e_2 = { error: e_2_1 }; }\n        finally {\n            try {\n                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);\n            }\n            finally { if (e_2) throw e_2.error; }\n        }\n        /* 駒\n        for (let [pos, piece] of boardmap.entries()) {\n            const pieceColor = piece.color === 'R' ? config.red : config.blue;\n            const pos_ = pos.split(',').map((e: string) => +e) as [number, number];\n            if (turn === 0) {\n                // 先手\n                this.piece((showAll || piece.turn === 0) ? pieceColor : config.grey,\n                    pos_, piece.turn === 1);\n            } else {\n                // 後手\n                this.piece((showAll || piece.turn === 1) ? pieceColor : config.grey,\n                    pos_, piece.turn === 0);\n            }\n        }\n        */\n    };\n    return Draw;\n}());\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Draw);\n;\n\n\n//# sourceURL=webpack://alice-chess-online/./src/draw.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/client.ts");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;