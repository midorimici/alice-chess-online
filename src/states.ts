let muted: boolean = true;

export const toggleMuted = () => {
  muted = !muted;
};

export const mutedValue = () => {
  return muted;
};

export const useMuted = () => {
  return { muted, toggleMuted };
};

let showOppositePieces: boolean = true;

export const toggleShowOppositePieces = () => {
  showOppositePieces = !showOppositePieces;
};

export const showOppositePiecesValue = () => {
  return showOppositePieces;
};

export const useShowOppositePieces = () => {
  return { showOppositePieces, toggleShowOppositePieces };
};
