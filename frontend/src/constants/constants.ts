// frontend/src/constants/constants.ts
import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const HABITS_PER_PAGE = 8;
export const CELL_SIZE = Math.floor(
  (SCREEN_WIDTH - 40) / (HABITS_PER_PAGE + 1)
);
export const DAY_LABEL_WIDTH = Math.floor(CELL_SIZE * 0.7);
