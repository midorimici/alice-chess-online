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
 * Returns the room key to set to the Database.
 * @param isPrivate Whether the room is private.
 * @param inputedRoomKey The room key specified by the user.
 * @param rooms The rooms data fetched from the Database.
 * @param isJoiningAsPlayer Whether the user is joining as a player.
 * @returns The room key to set to the Database.
 */
export const getRoomKey = (
  isPrivate: boolean,
  inputedRoomKey: string,
  rooms: Rooms,
  isJoiningAsPlayer: boolean
): string => {
  // When the room is private
  if (isPrivate) {
    return inputedRoomKey.trim();
  }
  // When the room is public
  else {
    // Search for an existing room.
    // If it does not exist, make a new room.
    // When there is no room of any kind
    if (rooms === null) {
      return generatePublicRoomKey([]);
    }
    // When there is at least one room
    else {
      const keys = Object.keys(rooms);
      const pubRooms = keys.filter((k: string) => k[0] === ' ');
      let roomCandidates: string[];
      const waitingPubRooms = pubRooms.filter((k: string) => rooms[k].state === 'waiting');
      // When the user is joining as a player
      if (isJoiningAsPlayer) {
        // Enter a room that is waiting for another player
        roomCandidates = waitingPubRooms;
      }
      // When the user is joining as audience
      else {
        const playingPubRooms = pubRooms.filter((k: string) => rooms[k].state === 'playing');
        // When there is any room that a game is ongoing
        if (playingPubRooms.length > 0) {
          // Enter a room that two players are playing
          roomCandidates = playingPubRooms;
        }
        // When there is no room that a game is ongoing
        else {
          // Enter a room that is waiting for another player
          roomCandidates = waitingPubRooms;
        }
      }
      return (
        roomCandidates[Math.floor(Math.random() * roomCandidates.length)] ??
        generatePublicRoomKey(keys)
      );
    }
  }
};

/**
 * Generate a room id of a public room.
 * @param keys Existing room ids.
 * @returns A room id that is a random 3 digits number following a half-width space character.
 */
const generatePublicRoomKey = (keys: string[]): string => {
  let res: string = randomKey();
  while (keys.includes(res)) {
    res = randomKey();
  }
  return res;
};

const randomKey = () => ' ' + String(Math.random()).slice(-3);
