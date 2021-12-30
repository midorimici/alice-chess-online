import { child, DataSnapshot, onDisconnect, onValue, ref } from 'firebase/database';
import { db } from './firebase';
import { audienceNumberValue, roomIdValue } from './states';

/** Returns the `Reference` to the current room. */
export const getRoomRef = () => {
  const roomId = roomIdValue();
  return ref(db, `rooms/${roomId}`);
};

/** Removes data of the room when one of the players disconnected. */
export const listenPlayerDisconnection = () => {
  onDisconnect(getRoomRef()).remove();
};

/** Decriments the audience number when an audience disconnected. */
export const listenAudienceDisconnection = () => {
  const audienceNumber = audienceNumberValue();
  onDisconnect(child(getRoomRef(), 'audienceNumber')).set(audienceNumber - 1);
};
