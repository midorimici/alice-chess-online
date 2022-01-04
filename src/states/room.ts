import { s } from './stateManager';

/** Room id. */
export const roomIdState = s<string>();

/** Names of players. */
export const playerNamesState = s<Pair<string>>();
