export const parseBoardState = (formattedBoardState: string): Board => {
  const flatten = formattedBoardState.split("").map((strSq) => {
    if (strSq === "0") {
      return null;
    } else if (strSq === "b" || strSq === "w") {
      return strSq;
    }
    throw Error("Invalid boardState text");
  });

  if (flatten.length !== 64) {
    throw Error("Invalid boardState length");
  }

  const parsed = [...new Array(8)].map((_, i) =>
    flatten.slice(i * 8, (i + 1) * 8)
  );
  return parsed;
};

export const formatBoardState = (board: Board = []) => {
  if (board.length < 1) {
    board = [...new Array(64)].fill(null);
  } else if (board.length !== 64) {
    throw Error("Invalid board length");
  }

  return board.flat().reduce<string>((prev, square) => {
    if (!square) {
      return (prev += "0");
    }
    if (square === "b" || square === "w") {
      return (prev += square);
    }
    throw Error("Invalid board text");
  }, "");
};
