type IgnoreConditionFunction<T> = (state: T) => boolean;

type State<T> = { key: string; dflt: T; ignore?: IgnoreConditionFunction<T> };

type SetState<T> = (newState: T) => void;

type ToggleState = () => void;

type UseStateReturnType<T> = { value: T; setState: SetState<T>; toggleState: ToggleState };

const states: Map<string, any> = new Map();

const generateRandomKey = () => String(Math.random()).slice(-10);

/**
 * Defines a state.
 * @param dflt The default value of the state.
 * @param ignore A condition that the state to be set should be ignored.
 * @returns Unique key of the state.
 * */
export const s = <T>(dflt: T = null, ignore?: IgnoreConditionFunction<T>): State<T> => {
  let key = generateRandomKey();
  while (states.has(key)) {
    key = generateRandomKey();
  }
  states.set(key, dflt);
  return { key, dflt, ignore };
};

export const useValue = <T>(state: State<T>): T => {
  return states.get(state.key);
};

export const useSetState = <T>(state: State<T>): SetState<T> => {
  const ignore = state.ignore;
  return (newState: T) => {
    if (ignore !== undefined && ignore(newState)) {
      return;
    }

    states.set(state.key, newState);
  };
};

export const useToggleState = <T>(state: State<T>): ToggleState => {
  return () => {
    const oldValue: T = states.get(state.key);
    states.set(state.key, !oldValue);
  };
};

export const useState = <T>(state: State<T>): UseStateReturnType<T> => ({
  value: useValue(state),
  setState: useSetState(state),
  toggleState: useToggleState(state),
});
