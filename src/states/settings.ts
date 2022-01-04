import { s } from './stateManager';

/** Whether the app makes a sound. */
export const isMutedState = s<boolean>(true);

/** Whether pieces on the opposite board are displayed transparently. */
export const showOppositePiecesState = s<boolean>(true);
