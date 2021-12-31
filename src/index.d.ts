declare type Pair<T> = [T, T];

declare type Vector = Pair<number>;

declare type PieceColor = 'W' | 'B';

declare type PieceName = 'N' | 'B' | 'R' | 'Q' | 'K' | 'P';

declare type Role = 'play' | 'watch';

declare type RoomState = 'waiting' | 'playing';

declare type Board = Record<string, string>;

declare type BoardMap = Map<keyof Board, Board[keyof Board]>;

declare type Turn = 0 | 1;

declare type Winner = Turn | 2;

/** [[White queen side, White king side], [Black king side, Black queen side]] */
declare type CastlingPotentials = Pair<Pair<boolean>>;

declare type RoomInfo = Partial<{
  players: Pair<string>;
  audienceNumber: number;
  state: RoomState;
  /** The game board seen from the white player. */
  board: Board;
  curTurn: Turn;
  /** Whether one of the players is checked. */
  checked: boolean;
  /** The destination position (seen from white) of the pawn that has moved two steps. */
  advanced2Pos: number[];
  winner: Winner;
  canCastle: CastlingPotentials;
}>;

declare type Rooms = Record<string, RoomInfo>;
