/** Whether the app makes a sound. */
let muted: boolean = true;

export const toggleMuted = () => {
  muted = !muted;
};

export const mutedValue = () => muted;

export const useMuted = () => ({ muted, toggleMuted });

/** Whether pieces on the opposite board are displayed transparently. */
let showOppositePieces: boolean = true;

export const toggleShowOppositePieces = () => {
  showOppositePieces = !showOppositePieces;
};

export const showOppositePiecesValue = () => showOppositePieces;

export const useShowOppositePieces = () => ({ showOppositePieces, toggleShowOppositePieces });

/** Whether the user is a player or a audience. */
let userRole: Role;

export const setUserRole = (state: Role) => {
  userRole = state;
};

export const userRoleValue = () => userRole;

export const useUserRole = () => ({ userRole, setUserRole });

/** The name of the user. */
let userName: string;

export const setUserName = (state: string) => {
  userName = state;
};

export const userNameValue = () => userName;

export const useUserName = () => ({ userName, setUserName });

/** Room id. */
let roomId: string;

export const setRoomId = (state: string) => {
  roomId = state;
};

export const roomIdValue = () => roomId;

export const useRoomId = () => ({ roomId, setRoomId });

/** The piece color of the player. */
let playerTurn: Turn;

export const setPlayerTurn = (state: Turn) => {
  playerTurn = state;
};

export const playerTurnValue = () => playerTurn;

export const usePlayerTurn = () => ({ playerTurn, setPlayerTurn });

/** Names of players. */
let playerNames: [string, string];

export const setPlayerNames = (state: [string, string]) => {
  playerNames = state;
};

export const playerNamesValue = () => playerNames;

export const usePlayerNames = () => ({ playerNames, setPlayerNames });
