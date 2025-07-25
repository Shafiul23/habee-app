// frontend/types.ts
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  CreateHabit: undefined;
  EditHabit: { habitId: number; currentName: string };
};

export type TabParamList = {
  Home: undefined;
  Calendar: undefined;
  Account: undefined;
  Settings: undefined;
};
