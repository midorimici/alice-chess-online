declare type Vector = [number, number];

declare type PieceColor = 'W' | 'B';

declare type PieceName = 'N' | 'B' | 'R' | 'Q' | 'K' | 'P';

declare type Role = 'play' | 'watch';

declare type RoomState = 'waiting' | 'playing';

declare type Board = Record<string, string>;

declare type BoardMap = Map<keyof Board, Board[keyof Board]>;

declare type Turn = 0 | 1;

declare type Winner = Turn | 2;

declare type CastlingPotentials = [[boolean, boolean], [boolean, boolean]];

declare type RoomInfo = Partial<{
  players: [string, string];
  audienceNumber: number;
  state: RoomState;
  boards: [Board, Board];
  curTurn: Turn;
  winner: Winner;
  canCastle: CastlingPotentials;
}>;

declare type Rooms = Record<string, RoomInfo>;
