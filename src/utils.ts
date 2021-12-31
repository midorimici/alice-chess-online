/**
 * Converts a map to an object.
 * @param m An original map.
 */
export const m2o = (m: BoardMap) => {
  const res: Board = {};
  for (const [k, v] of m.entries()) {
    res[k] = v;
  }
  return res;
};

/**
 * Generate a room id of a public room.
 * @param keys Existing room ids.
 * @returns A room id that is a random 3 digits number following a half-width space character.
 */
export const generatePublicRoomKey = (keys: string[]): string => {
  let res: string = randomKey();
  while (keys.includes(res)) {
    res = randomKey();
  }
  return res;
};

const randomKey = () => ' ' + String(Math.random()).slice(-3);
