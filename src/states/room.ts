/** Room id. */
let roomId: string;

export const setRoomId = (state: string) => {
  roomId = state;
};

export const roomIdValue = () => roomId;

/** Names of players. */
let playerNames: Pair<string>;

export const setPlayerNames = (state: Pair<string>) => {
  playerNames = state;
};

export const playerNamesValue = () => playerNames;

/** A `Map` object that represents game board seen from the current user. */
let boardMap: BoardMap = new Map();

export const setBoardMap = (state: BoardMap) => {
  boardMap = state;
};

export const boardMapValue = () => boardMap;
