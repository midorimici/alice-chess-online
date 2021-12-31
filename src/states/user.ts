/** Whether the user is a player or a audience. */
let userRole: Role;

export const setUserRole = (state: Role) => {
  userRole = state;
};

export const userRoleValue = () => userRole;

/** The name of the user. */
let userName: string;

export const setUserName = (state: string) => {
  userName = state;
};

export const userNameValue = () => userName;

/** The piece color of the player. */
let playerTurn: Turn;

export const setPlayerTurn = (state: Turn) => {
  playerTurn = state;
};

export const playerTurnValue = () => playerTurn;
