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
