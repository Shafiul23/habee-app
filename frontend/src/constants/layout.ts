import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;

export const getLayoutConstants = (habitCount: number) => {
  let habitsPerPage = 5;
  if (habitCount > 5 && habitCount <= 8) habitsPerPage = habitCount;
  else if (habitCount > 8) habitsPerPage = 8;

  const cellSize = Math.floor((SCREEN_WIDTH - 40) / (habitsPerPage + 1));
  const dayLabelWidth = Math.floor(cellSize * 0.7);

  return { cellSize, dayLabelWidth, habitsPerPage };
};
