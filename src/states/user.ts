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

/** The piece color of the player. */
let playerTurn: Turn;

export const setPlayerTurn = (state: Turn) => {
  playerTurn = state;
};

export const playerTurnValue = () => playerTurn;

export const usePlayerTurn = () => ({ playerTurn, setPlayerTurn });
