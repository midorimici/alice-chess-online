import { child, DataSnapshot, get, ref, set } from 'firebase/database';
import { db } from './firebase';
import { initBoard, rotateBoard } from './game/game';
import {
  showPrivateRoomEmptyMessage,
  showPublicRoomEmptyMessage,
  showRoomFullMessage,
} from './lib/messageHandlers';
import { listenPlayerDisconnection, listenRoomDataChange } from './listeners';
import { setPlayerTurn, setRoomId, setUserName } from './states';
import { generatePublicRoomKey, m2o } from './utils';

/**
 * Make the user enter the specified room.
 * @param info Data from the form, including room visibility, room id, role and name of the user.
 */
export const handleEnterRoom = (info: {
  private: boolean;
  roomId: string;
  role: Role;
  name: string;
}) => {
  const isJoiningAsPlayer = info.role === 'play';
  let roomId: string;
  const roomsRef = ref(db, 'rooms');
  get(roomsRef)
    .then((snapshot: DataSnapshot) => {
      const rooms: Rooms = snapshot.val();
      // When the room is private
      if (info.private) {
        roomId = info.roomId;
      }
      // When the room is public
      else {
        // Search for an existing room.
        // If it does not exist, make a new room.
        // const keys = Object.keys(rooms);
        // const pubRooms = keys.filter((k: string) => k[0] === ' ');
        // const waitingPubRooms = pubRooms.filter((k: string) => rooms.get(k).state === 'waiting');
        // const playingPubRooms = pubRooms.filter((k: string) => rooms.get(k).state === 'playing');
        // const targetRooms =
        //   info.role === 'play'
        //     ? waitingPubRooms
        //     : playingPubRooms.length
        //     ? playingPubRooms
        //     : waitingPubRooms;
        // const roomId = info.private
        //   ? info.roomId
        //   : targetRooms[Math.floor(Math.random() * targetRooms.length)] ?? generatePublicRoomKey();
        // const room = rooms.get(roomId);
      }

      const room: RoomInfo = rooms ? rooms[roomId] : undefined;
      setRoomId(roomId);
      // When the specified room does not exist
      if (room === undefined) {
        // When the user is joining as a player
        if (isJoiningAsPlayer) {
          // Create a new room
          const roomInfo: RoomInfo = {
            players: [info.name, ''],
            audienceNumber: 0,
            state: 'waiting',
            curTurn: 0,
            canCastle: [
              [true, true],
              [true, true],
            ],
          };
          // Set room data
          set(child(roomsRef, roomId), roomInfo).catch((err) => console.error(err));
          // Set states
          setUserName(info.name);
          setPlayerTurn(0);
          // Setup disconnection event listener
          listenPlayerDisconnection();
          // Setup room state change event listener
          listenRoomDataChange('preparing', true);
        }
        // When the user is joining as audience
        else {
          if (info.private) {
            showPrivateRoomEmptyMessage();
          } else {
            showPublicRoomEmptyMessage();
          }
        }
      }
      // When the room with the id already exists
      else {
        const roomRef = child(roomsRef, roomId);
        // When the user is joining as a player
        if (isJoiningAsPlayer) {
          // When a player is waiting
          if (room.state === 'waiting') {
            // Add new player's data
            set(child(roomRef, 'players/1'), info.name).catch((err) => console.error(err));
            // Update the room state
            const roomState: RoomState = 'playing';
            set(child(roomRef, 'state'), roomState).catch((err) => console.error(err));
            // Generate and set initial boards
            const boardMap: BoardMap = initBoard();
            const boards: [Board, Board] = [m2o(boardMap), m2o(rotateBoard(boardMap))];
            set(child(roomRef, 'boards'), boards).catch((err) => console.error(err));
            // Set states
            setUserName(info.name);
            setPlayerTurn(1);
            // Setup disconnection event listener
            listenPlayerDisconnection();
            // Setup room state change event listener
            listenRoomDataChange('playing', true);
          }
          // When two players are already in the room
          else {
            showRoomFullMessage();
          }
        }
        // When the user is joining as audience
        else {
          // Update the audience number
          set(child(roomRef, 'audienceNumber'), room.audienceNumber + 1).catch((err) =>
            console.error(err)
          );
          // Setup room state change event listener
          listenRoomDataChange('preparing', false);
        }
      }
    })
    .catch((err) => console.error(err));
};
