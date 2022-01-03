import { s } from './stateManager';

/** Whether the user is a player or a audience. */
export const userRoleState = s<Role>();

/** The name of the user. */
export const userNameState = s<string>();

/** The piece color of the player. */
export const playerTurnState = s<Turn>();
