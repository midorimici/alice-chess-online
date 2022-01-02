import Draw from '~/game/draw';

/** Whether the app makes a sound. */
let isMuted: boolean = true;

const toggleIsMuted = () => {
  isMuted = !isMuted;
};

export const isMutedValue = () => isMuted;

export const useIsMuted = () => ({ isMuted, toggleIsMuted });

/** Whether pieces on the opposite board are displayed transparently. */
let showOppositePieces: boolean = true;

const toggleShowOppositePieces = () => {
  showOppositePieces = !showOppositePieces;
};

export const showOppositePiecesValue = () => showOppositePieces;

export const useShowOppositePieces = () => ({ showOppositePieces, toggleShowOppositePieces });

/** `Draw` instance. */
let draw: Draw;

export const drawValue = () => draw;

export const setDraw = (state: Draw) => {
  draw = state;
};
