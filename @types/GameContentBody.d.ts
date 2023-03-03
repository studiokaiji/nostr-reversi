type GameContentBody = {
  version: string;
  kind: number;
  put: [number, number] | [];
  boardState: string;
};
