type Room = {
  id: string;
  players: {
    b: string;
    w: string;
  };
  isGameStarted: boolean;
  owner: string;
  currentPlayer: string;
  lastUpdatedAt: Date;
  joinApplicants: string[];
  latestEventId: string;
  history: [number, number][];
};
