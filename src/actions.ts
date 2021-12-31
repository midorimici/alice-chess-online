import {
  child,
  DataSnapshot,
  get,
  limitToLast,
  onValue,
  push,
  query,
  ref,
  set,
  update,
} from 'firebase/database';
import { db } from './firebase';
import {
  cannotMove,
  enPassantReq,
  initBoard,
  isChecked,
  renewedBoard,
  rotateBoard,
} from './game/game';
import {
  showPrivateRoomEmptyMessage,
  showPublicRoomEmptyMessage,
  showRoomFullMessage,
} from './lib/messageHandlers';
import { getRoomRef, listenPlayerDisconnection, listenRoomDataChange } from './listeners';
import {
  playerTurnValue,
  setPlayerTurn,
  setRoomId,
  setUserName,
  userNameValue,
  userRoleValue,
} from './states';
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
        roomId = info.roomId.trim();
      }
      // When the room is public
      else {
        // Search for an existing room.
        // If it does not exist, make a new room.
        // When there is no room of any kind
        if (rooms === null) {
          roomId = generatePublicRoomKey([]);
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
          roomId =
            roomCandidates[Math.floor(Math.random() * roomCandidates.length)] ??
            generatePublicRoomKey(keys);
        }
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
            state: 'waiting',
            curTurn: 0,
            checked: false,
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
            // Generate and set initial board
            const boardMap: BoardMap = initBoard();
            const board: Board = m2o(boardMap);
            set(child(roomRef, 'board'), board).catch((err) => console.error(err));
            // Set states
            setUserName(info.name);
            setPlayerTurn(1);
            // Setup disconnection event listener
            listenPlayerDisconnection();
            // Setup room state change event listener
            listenRoomDataChange('preparing', true);
          }
          // When two players are already in the room
          else {
            showRoomFullMessage();
          }
        }
        // When the user is joining as audience
        else {
          // Update the audience number
          set(child(roomRef, 'audienceNumber'), (room.audienceNumber ?? 0) + 1).catch((err) =>
            console.error(err)
          );
          // Set the viewpoint
          setPlayerTurn(0);
          // Setup room state change event listener
          listenRoomDataChange('preparing', false);
        }
      }
    })
    .catch((err) => console.error(err));
};

/**
 * Move the piece and update the game board.
 * @param boardId Which side of board the piece was before the move.
 * @param from The original position of the piece.
 * @param to The destination position of the piece.
 * @param promoteTo Which piece the piece will promote to. Only available when the piece is to promote.
 */
export const handleMovePiece = (
  boardId: 0 | 1,
  from: Vector,
  to: Vector,
  promoteTo?: PieceName
) => {
  const roomRef = getRoomRef();
  const playerTurn = playerTurnValue();
  const colors = ['W', 'B'] as const;

  onValue(
    roomRef,
    (snapshot: DataSnapshot) => {
      if (!snapshot.exists()) {
        return;
      }

      const room: RoomInfo = snapshot.val();

      if (room.curTurn !== playerTurn) {
        console.warn(`curTurn and playerTurn do not match: ${room.curTurn}, ${playerTurn}`);
      }

      const board = room.board;
      const canCastle: CastlingPotentials = room.canCastle;

      const boardMap: BoardMap = new Map(Object.entries(board));
      /** The game board seen from the current player. */
      const playerBoard: BoardMap = playerTurn === 0 ? boardMap : rotateBoard(boardMap);
      const newCanCastle: CastlingPotentials = [...canCastle];
      const pieceName = playerBoard.get(`${boardId},${String(from)}`)?.[1] as PieceName;

      // Castling
      // When rook has moved
      if (pieceName === 'R') {
        // Queen side
        if (String(from) === '0,7') {
          newCanCastle[playerTurn][playerTurn] = false;
        }
        // King side
        if (String(from) === '7,7') {
          newCanCastle[playerTurn][1 - playerTurn] = false;
        }
      }
      // When king has moved
      if (pieceName === 'K') {
        newCanCastle[playerTurn] = [false, false];
        // When a castling has occured
        if (Math.abs(to[0] - from[0]) === 2) {
          // Move rook
          let newX: number, oldX: number;
          if (to[0] === 2) {
            // White queen side
            [newX, oldX] = [3, 0];
          } else if (to[0] == 6) {
            // White king side
            [newX, oldX] = [5, 7];
          } else if (to[0] == 5) {
            // Black queen side
            [newX, oldX] = [4, 7];
          } else if (to[0] == 1) {
            // Black king side
            [newX, oldX] = [2, 0];
          }
          // Update the board
          playerBoard.set(`${1 - boardId},${newX},7`, colors[playerTurn] + 'R');
          playerBoard.delete(`${boardId},${oldX},7`);
        }
      }

      // When en passant has occured
      if (enPassantReq(from, to, pieceName, boardId, boardId, playerBoard)) {
        // Remove the attacked pawn
        playerBoard.delete(`${boardId},${to[0]},${to[1] + 1}`);
      }
      /** The destination position when the pawn has moved two steps. */
      const playerAdvanced2Pos =
        pieceName === 'P' && from[1] - to[1] === 2 ? [1 - boardId, ...to] : null;
      /** The destination position seen from opponent when the pawn has moved two steps. */
      const opponentAdvanced2Pos = playerAdvanced2Pos ? [...playerAdvanced2Pos] : null;
      if (opponentAdvanced2Pos !== null) {
        opponentAdvanced2Pos[1] = 7 - opponentAdvanced2Pos[1];
        opponentAdvanced2Pos[2] = 7 - opponentAdvanced2Pos[2];
      }

      // Convert to the position seen from white
      const newAdvanced2Pos = playerTurn === 0 ? playerAdvanced2Pos : opponentAdvanced2Pos;

      set(child(roomRef, 'advanced2Pos'), newAdvanced2Pos).catch((err) => console.error(err));

      // Move the piece.
      const playerNewBoard = renewedBoard(boardId, from, to, playerBoard);

      // When it is a promotion
      if (promoteTo) {
        // Promote the pawn.
        playerNewBoard.set(`${1 - boardId},${String(to)}`, colors[playerTurn] + promoteTo);
      }

      // Update the board from the opponent viewpoint.
      const opponentNewBoard = rotateBoard(playerNewBoard);

      // Switch the turn.
      const newTurn: Turn = (1 - playerTurn) as Turn;

      // Judge check.
      /** Whether the opponent player is checked. */
      const opponentIsChecked = isChecked(colors[1 - playerTurn], playerNewBoard);
      /** Whether the opponent player cannot move any pieces. */
      const opponentIsFreezed = cannotMove(
        colors[1 - playerTurn],
        opponentNewBoard,
        opponentAdvanced2Pos,
        newCanCastle
      );

      // Judge the winner.
      let winner: Winner;
      if (opponentIsFreezed) {
        if (opponentIsChecked) {
          // Checkmate. The current player wins.
          winner = playerTurn;
        } else {
          // Stale mate. It is draw.
          winner = 2;
        }
        // Set the winner to the Database
        set(child(roomRef, 'winner'), winner).catch((err) => console.error(err));
      }

      /** The renewed game board seen from the white player. */
      const newBoard: BoardMap = playerTurn === 0 ? playerNewBoard : opponentNewBoard;

      // Update the Database
      const updateValues: RoomInfo = {
        board: m2o(newBoard),
        curTurn: newTurn,
        checked: opponentIsChecked,
        canCastle: newCanCastle,
      };
      update(roomRef, updateValues).catch((err) => console.error(err));
    },
    { onlyOnce: true }
  );
};

/**
 * Handles process when a user send a chat message.
 * @param message A message content that the user is going to send.
 */
export const handleChatSend = (message: string) => {
  const userName = userNameValue();
  const userRole = userRoleValue();
  const chatMessageData: ChatMessage = {
    name: userName,
    isPlayer: userRole === 'play',
    message,
  };
  const chatRef = child(getRoomRef(), 'chatMessages');
  // Add a new message.
  push(chatRef, chatMessageData).catch((err) => console.error(err));
  // Pick up only latest 100 messages to limit all messages up to 100.
  onValue(
    query(chatRef, limitToLast(100)),
    (snapshot: DataSnapshot) => {
      if (!snapshot.exists()) {
        return;
      }

      const messages: ChatMessage[] = snapshot.val();
      set(chatRef, messages).catch((err) => console.error(err));
    },
    { onlyOnce: true }
  );
};
