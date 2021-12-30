/** Room id. */
let roomId: string;

export const setRoomId = (state: string) => {
  roomId = state;
};

export const roomIdValue = () => roomId;

export const useRoomId = () => ({ roomId, setRoomId });

/** Names of players. */
let playerNames: [string, string];

export const setPlayerNames = (state: [string, string]) => {
  playerNames = state;
};

export const playerNamesValue = () => playerNames;

export const usePlayerNames = () => ({ playerNames, setPlayerNames });
