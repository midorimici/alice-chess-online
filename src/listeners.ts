import { onDisconnect, ref } from 'firebase/database';
import { db } from './firebase';
import { roomIdValue } from './states';

/** Returns the `Reference` to the current room. */
export const getRoomRef = () => {
  const roomId = roomIdValue();
  return ref(db, `rooms/${roomId}`);
};

/** Removes data of the room when one of the players disconnected. */
export const listenPlayerDisconnection = () => {
  onDisconnect(getRoomRef()).remove();
};
