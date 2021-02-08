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

/***/ "./svr/server.ts":
/*!***********************!*\
  !*** ./svr/server.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! http */ \"http\");\n/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(http__WEBPACK_IMPORTED_MODULE_1__);\nvar __values = (undefined && undefined.__values) || function(o) {\n    var s = typeof Symbol === \"function\" && Symbol.iterator, m = s && o[s], i = 0;\n    if (m) return m.call(o);\n    if (o && typeof o.length === \"number\") return {\n        next: function () {\n            if (o && i >= o.length) o = void 0;\n            return { value: o && o[i++], done: !o };\n        }\n    };\n    throw new TypeError(s ? \"Object is not iterable.\" : \"Symbol.iterator is not defined.\");\n};\nvar __read = (undefined && undefined.__read) || function (o, n) {\n    var m = typeof Symbol === \"function\" && o[Symbol.iterator];\n    if (!m) return o;\n    var i = m.call(o), r, ar = [], e;\n    try {\n        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);\n    }\n    catch (error) { e = { error: error }; }\n    finally {\n        try {\n            if (r && !r.done && (m = i[\"return\"])) m.call(i);\n        }\n        finally { if (e) throw e.error; }\n    }\n    return ar;\n};\nvar __spread = (undefined && undefined.__spread) || function () {\n    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));\n    return ar;\n};\n\n\nvar app = express__WEBPACK_IMPORTED_MODULE_0__();\napp.use(express__WEBPACK_IMPORTED_MODULE_0__.static(process.cwd() + '/public'));\nvar server = http__WEBPACK_IMPORTED_MODULE_1__.createServer(app);\nvar io = __webpack_require__(/*! socket.io */ \"socket.io\")(server, {\n    cors: {\n        origin: 'https://geister-online.netlify.app',\n        methods: ['GET', 'POST']\n    }\n});\napp.get('/', function (req, res) {\n    res.sendFile(process.cwd() + '/public/ja/index.html');\n});\n/** 部屋番号と部屋のデータの Map\n * @property player1 先に入室したプレイヤー\n * @property player2 後から入室したプレイヤー\n * @property state 部屋の状態\n*/\nvar rooms = new Map();\n/**\n * 先手の初期盤面を生成する\n * @returns Map\n */\nvar initBoard = function () {\n    var m = new Map();\n    var order = 'RNBQKBNR';\n    for (var i = 0; i < 8; i++) {\n        m.set(\"0,\" + i + \",7\", 'W' + order[i]);\n        m.set(\"0,\" + i + \",6\", 'WP');\n        m.set(\"0,\" + i + \",0\", 'B' + order[i]);\n        m.set(\"0,\" + i + \",1\", 'BP');\n    }\n    return m;\n};\n/**\n * 盤面を変換する\n * @param to 変換先。 0 -> 先手, 1 -> 後手\n */\nvar rotateBoard = function (to) {\n    var e_1, _a;\n    var orig = board[1 - to];\n    var res = new Map();\n    try {\n        for (var _b = __values(orig.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {\n            var _d = __read(_c.value, 2), pos = _d[0], piece = _d[1];\n            var _e = __read(pos.split(',').map(function (e) { return +e; }), 3), b = _e[0], x = _e[1], y = _e[2];\n            res.set(b + \",\" + (7 - x) + \",\" + (7 - y), piece);\n        }\n    }\n    catch (e_1_1) { e_1 = { error: e_1_1 }; }\n    finally {\n        try {\n            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);\n        }\n        finally { if (e_1) throw e_1.error; }\n    }\n    return res;\n};\n/**\n * side が勝利条件を満たすか\n * @param taken それぞれが取った駒の色と数\n * @param posOnBoard 盤面上にある駒の位置リスト\n * @param side 先手か後手か\n * @param moved side が今駒を動かしたか\n */\nvar winReq = function (taken, posOnBoard, side, moved) {\n    if (moved) {\n        // 青を4つ取った\n        // or 青が盤面に出た\n        return (taken[side]['B'] === 4\n            || (posOnBoard.indexOf('0,-1') !== -1\n                || posOnBoard.indexOf('5,-1') !== -1));\n    }\n    else {\n        // 赤を4つ取らせた\n        return taken[(side + 1) % 2]['R'] === 4;\n    }\n};\n// 盤面。{'0,0,0': 'WN'} のフォーマット\n/** 先手から見た盤面, 後手から見た盤面 */\nvar board;\n/** 先手, 後手の名前と socket id */\nvar players;\n/** 現在のターン */\nvar curTurn = 0;\n/** それぞれが取った駒の色と数 */\nvar takenPieces = [{ 'R': 0, 'B': 0 }, { 'R': 0, 'B': 0 }];\n/** 勝者 0 - 先手, 1 - 後手 */\nvar winner;\nio.on('connection', function (socket) {\n    socket.on('enter room', \n    /**\n     * 入室したときのサーバ側の処理\n     * @param info 入室者のデータ\n     */\n    function (info) {\n        var _a, _b, _c;\n        socket.info = info;\n        var room = rooms.get(info.roomId);\n        if (info.role === 'play') {\n            // 対戦者として参加\n            if (room) {\n                // 指定のルームに対戦者がいたとき\n                if (room.state === 'waiting') {\n                    // 対戦者が1人待機している\n                    room.player2 = {\n                        id: socket.id,\n                        name: info.name,\n                        turn: 1\n                    };\n                    room.state = 'playing';\n                    socket.join(info.roomId);\n                    players = [\n                        {\n                            name: room.player1.name,\n                            id: room.player1.id\n                        },\n                        {\n                            name: room.player2.name,\n                            id: room.player2.id\n                        }\n                    ];\n                    // 盤面生成\n                    board = [initBoard(), new Map()];\n                    board[1] = rotateBoard(1);\n                    // クライアントへ送信\n                    (_a = io.to(info.roomId)).emit.apply(_a, __spread(['watch', __spread(board[0])], players.map(function (e) { return e.name; }), [curTurn, takenPieces]));\n                    (_b = io.to(room.player1.id)).emit.apply(_b, __spread(['game', __spread(board[0]), 'W', true], players.map(function (e) { return e.name; }), [takenPieces]));\n                    (_c = io.to(room.player2.id)).emit.apply(_c, __spread(['game', __spread(board[1]), 'B', false], players.map(function (e) { return e.name; }), [takenPieces]));\n                }\n                else {\n                    // 対戦者がすでに2人いる\n                    socket.emit('room full', info.roomId);\n                    socket.info.role = 'watch';\n                }\n            }\n            else {\n                // 新たにルームを作成する\n                rooms.set(info.roomId, {\n                    player1: {\n                        id: socket.id,\n                        name: info.name,\n                        turn: 0\n                    },\n                    player2: {\n                        id: '',\n                        name: '',\n                        turn: 0\n                    },\n                    state: 'waiting'\n                });\n                socket.join(info.roomId);\n                socket.emit('wait opponent');\n            }\n        }\n        else {\n            // 観戦者として参加\n            if (room) {\n                // 指定のルームが存在するとき\n                socket.join(info.roomId);\n                if (room.state === 'waiting') {\n                    // 対戦者が1人待機している\n                    socket.emit('wait opponent');\n                }\n                else {\n                    // 対戦者がすでに2人いて対戦中\n                    socket.emit.apply(socket, __spread(['watch', __spread(board[0])], players.map(function (e) { return e.name; }), [curTurn, takenPieces]));\n                    if (winner === 0 || winner === 1) {\n                        socket.emit.apply(socket, __spread(['tell winner', players.map(function (e) { return e.name; })[winner], __spread(board[0])], players.map(function (e) { return e.name; }), [takenPieces]));\n                    }\n                }\n            }\n            else {\n                // 指定したルームがないとき\n                socket.emit('no room', info.roomId);\n            }\n        }\n    });\n    socket.on('move piece', \n    /**\n     * 駒を動かしたときのサーバ側の処理\n     * @param boardmap 盤面データ\n     */\n    function (boardnum, from, to) {\n        var _a, _b, _c;\n        var roomId = socket.info.roomId;\n        var newBoard = board[curTurn];\n        // 駒の移動\n        newBoard.set(1 - boardnum + \",\" + to, newBoard.get(boardnum + \",\" + from));\n        newBoard.delete(boardnum + \",\" + from);\n        // 敵駒があったら削除\n        newBoard.delete(boardnum + \",\" + to);\n        // 相手の駒を取ったとき\n        /*\n        if (board.has(String(dest)) && board.get(String(dest)).turn !== turn) {\n            // 取った駒の色を記録する\n            takenPieces[turn][board.get(String(dest)).color] += 1;\n        }*/\n        // turn 目線のボードを更新する\n        board[curTurn] = newBoard;\n        // 相手目線のボードを更新する\n        board[1 - curTurn] = rotateBoard(1 - curTurn);\n        // ターン交代\n        curTurn = 1 - curTurn;\n        // 勝敗判定\n        /*\n        if (winReq(takenPieces, Array.from(board.keys()), turn, true)) {\n            winner = turn;\n        } else if (winReq(takenPieces, Array.from(board.keys()), (turn+1)%2 as 0 | 1, false)) {\n            winner = (turn+1)%2 as 0 | 1;\n        }*/\n        // 盤面データをクライアントへ\n        (_a = io.to(roomId)).emit.apply(_a, __spread(['watch', __spread(board[0])], players.map(function (e) { return e.name; }), [curTurn, takenPieces]));\n        (_b = io.to(players[0].id)).emit.apply(_b, __spread(['game', __spread(board[0]), 'W', true], players.map(function (e) { return e.name; }), [takenPieces]));\n        (_c = io.to(players[1].id)).emit.apply(_c, __spread(['game', __spread(board[1]), 'B', true], players.map(function (e) { return e.name; }), [takenPieces]));\n        // 勝者を通知する\n        /*\n        if (winner === 0 || winner === 1) {\n            io.to(roomId).emit('tell winner to audience and first',\n                players.map(e => e.name)[winner], [...board[0]]\n                , ...players.map(e => e.name), takenPieces);\n            io.to(second.id).emit('tell winner to second',\n                players.map(e => e.name)[winner], [...board[1]]\n                , ...players.map(e => e.name), takenPieces);\n        }*/\n    });\n    socket.on('chat message', function (msg) {\n        io.to(socket.info.roomId).emit('chat message', msg, socket.info.role === 'play', socket.info.name);\n    });\n    socket.on('disconnect', function () {\n        var info = socket.info;\n        // 接続が切れたとき\n        if (info) {\n            // ルームに入っていたとき\n            if (info.role === 'play') {\n                // 対戦者としてルームにいたとき\n                rooms.delete(info.roomId);\n                // 観戦者ともう一方の対戦者も退出させる\n                socket.to(info.roomId).leave(info.roomId);\n                socket.to(info.roomId).emit('player discon', info.name);\n            }\n        }\n    });\n});\nserver.listen(process.env.PORT || 3000);\n\n\n//# sourceURL=webpack://alice-chess-online/./svr/server.ts?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");;

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");;

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("socket.io");;

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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	__webpack_require__("./svr/server.ts");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;