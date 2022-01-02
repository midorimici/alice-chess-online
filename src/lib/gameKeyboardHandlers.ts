import { switchActiveBoard } from '~/states';
import { drawBoard } from './gameHandlers';

export const handleSwitchActiveBoard = () => {
  switchActiveBoard();
  drawBoard();
};
