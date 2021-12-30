import {
  child,
  DatabaseReference,
  DataSnapshot,
  get,
  off,
  onDisconnect,
  onValue,
  ref,
} from 'firebase/database';
import { handlePlayerGameScreen, showWaitingPlayerScreen } from './lib/canvasHandlers';
import { db } from './firebase';
import { t } from './i18n';
import { showAudienceNumber } from './lib/messageHandlers';
import { playerTurnValue, roomIdValue, setBoardMap, setPlayerNames } from './states';

/** Returns the `Reference` to the current room. */
export const getRoomRef = () => {
  const roomId = roomIdValue();
  return ref(db, `rooms/${roomId}`);
};

/** Removes data of the room when one of the players disconnected. */
export const listenPlayerDisconnection = () => {
  onDisconnect(getRoomRef()).remove();
};

/**
 * Handles process when the room data is changed, such as a new player joins, chat messages and so on.
 * @param phase If this arg is `preparing`, it listens to the `state` field of the data.
 *              If this arg is `playing`, it listens to the `boards` and check for the winner.
 *              In both cases, it listens to the `audienceNumber` and `chatMessages`.
 * @param isPlayer Whether the user is joining as a player.
 */
export const listenRoomDataChange = (phase: 'preparing' | 'playing', isPlayer: boolean) => {
  const roomRef = getRoomRef();
  const playerTurn: Turn = playerTurnValue();

  if (phase === 'preparing') {
    handleRoomValueChange(roomRef, 'state', (val) => {
      const state: RoomState = val;
      handleRoomStateChange(state, isPlayer);
    });
  } else if (phase === 'playing') {
    handleRoomValueChange(roomRef, 'boards', (val) => {
      const boards: [Board, Board] = val;
      setBoardMap(new Map(Object.entries(boards[playerTurn])));
      onValue(
        roomRef,
        (snapshot: DataSnapshot) => {
          const info: RoomInfo = snapshot.val();
          handleRoomBoardsChange(isPlayer, info.curTurn, info.canCastle);
          // const winner: PlayerId = info.winner;
          // if (winner !== undefined) {
          //   handleRoomWinnerChange(winner, info.boards, info.takenPieces);
          // }
        },
        { onlyOnce: true }
      );
    });
  }

  onAudienceNumberChange(roomRef);

  // const { chatInitialized, setChatInitialized } = useChatInitialized();

  // if (chatInitialized) {
  //   return;
  // }

  // onChildAdded(query(child(roomRef, 'chatMessages'), limitToLast(20)), (snapshot: DataSnapshot) => {
  //   if (!snapshot.exists()) {
  //     return;
  //   }

  //   const message: ChatMessage = snapshot.val();
  //   addChatMessage(message);
  // });
  // setChatInitialized(true);
};

/**
 * Listens for data changes at the specified path and trigger a callback.
 * Detaches all listeners except itself.
 * @param ref Database reference to the room.
 * @param path Path to the data from the reference.
 * @param callback A callback that fires when the data in the specified path exists. Receives snapshot value as a parameter.
 */
const handleRoomValueChange = (
  ref: DatabaseReference,
  path: keyof RoomInfo,
  callback: (val: any) => void
) => {
  off(ref);
  onValue(child(ref, path), (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      // Reload the page when one of the player is disconnected.
      alert(t('disconnected'));
      location.reload();
    }
  });
};

/**
 * Handles process when the room state is changed.
 * @param state The current state of the room, `waiting` or `playing`.
 * @param isPlayer Whether the user is joining as a player.
 */
const handleRoomStateChange = (state: RoomState, isPlayer: boolean) => {
  // When a player is waiting for the opponent
  if (state === 'waiting') {
    // Move to wait opponent screen.
    showWaitingPlayerScreen();
  }
  // When two players are in the room and the game is ongoing
  else {
    get(child(getRoomRef(), 'players')).then((snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const players: [string, string] = snapshot.val();
        setPlayerNames(players);
        listenRoomDataChange('playing', isPlayer);
      }
    });
  }
};

/**
 * Listens for the number of audience in the room and update display of the number when it is changed.
 * @param roomRef Database reference to the room.
 */
const onAudienceNumberChange = (roomRef: DatabaseReference) => {
  const audienceNumberRef = child(roomRef, 'audienceNumber');
  onValue(audienceNumberRef, (snapshot: DataSnapshot) => {
    if (!snapshot.exists()) {
      return;
    }

    const num: number = snapshot.val();
    showAudienceNumber(num);

    // Update disconnection listener
    const onDisconnectRef = onDisconnect(audienceNumberRef);
    onDisconnectRef.cancel();
    onDisconnectRef.set(num - 1);
  });
};

/**
 * Handles process when the game boards are changed.
 * @param isPlayer Whether the user is joining as a player.
 * @param curTurn The current turn.
 * @param canCastle Lists that represent whether it is available to castle.
 */
const handleRoomBoardsChange = (
  isPlayer: boolean,
  curTurn: Turn,
  canCastle: CastlingPotentials
) => {
  const playerTurn = playerTurnValue();
  // const playerNames = playerNamesValue();
  if (isPlayer) {
    handlePlayerGameScreen(curTurn === playerTurn, false, null, canCastle);
  } else {
    // showGameScreenForAudience(boards[0], curTurn, playerNames, takenPieces);
  }
};
