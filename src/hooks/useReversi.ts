import { useEffect, useMemo, useRef, useState } from "react";

const INITIAL_BOARD = (() => {
  const board: (null | Disc)[][] = Array.from(new Array(8), () =>
    new Array(8).fill(0).map(() => null)
  );
  board[3][3] = "b";
  board[3][4] = "w";
  board[4][3] = "b";
  board[4][4] = "w";
  return board;
})();

export const useReversi = (firstPlayerDisc: Disc = "b") => {
  const [board, setBoard] = useState(INITIAL_BOARD);

  const playerDiscRef = useRef<Disc>(firstPlayerDisc);

  const changePlayer = () => {
    playerDiscRef.current = playerDiscRef.current === "b" ? "w" : "b";
  };

  const [isEnd, setIsEnd] = useState(false);

  const [putablePosition, setPutablePosition] = useState<[number, number][]>(
    []
  );

  useEffect(() => {
    if (!window) return;
    setPutablePosition(getPutablePosition(playerDiscRef.current));
  }, [playerDiscRef.current, board, window]);

  const isInitialCall = useRef(true);

  useEffect(() => {
    if (isInitialCall) {
      isInitialCall.current = false;
      return;
    }
    if (putablePosition.length > 0) return;

    // 双方ともに石を置けなくなった場合
    if (
      putablePosition.length < 1 &&
      !getPutablePosition(playerDiscRef.current === "b" ? "w" : "b").length
    ) {
      setIsEnd(true);
      return;
    }

    // 自分が石を置けない場合
    if (putablePosition.length < 1) {
      // 石を置けないのでそのままプレイヤー交代
      changePlayer();
      return;
    }
  }, [putablePosition]);

  const putDisc = ({ xIndex, yIndex }: Position) => {
    console.log(playerDiscRef.current);

    // 既に石が置いてあれば処理を終了
    if (board[yIndex][xIndex]) {
      return false;
    }

    //判定
    const willBeReturned = checkDisc(playerDiscRef.current, { yIndex, xIndex });

    // 1つも石を返せなければ処理を終了
    if (willBeReturned.length === 0) {
      return false;
    }

    // 問題なければ石を置く
    const newBoard = [...board];
    newBoard[yIndex][xIndex] = playerDiscRef.current;

    // 置いた石との間にある石を返す
    for (let i = 0, l = willBeReturned.length; i < l; i++) {
      newBoard[willBeReturned[i][0]][willBeReturned[i][1]] =
        playerDiscRef.current;
    }

    setBoard(newBoard);
    changePlayer();

    return true;
  };

  const checkDisc = (disc: Disc, currentPosition: Position) => {
    const change: number[][] = [];

    [
      [0, 1], // 右
      [0, -1], // 左
      [-1, 0], // 上
      [1, 0], // 下
      [-1, -1], // 左上
      [1, 1], // 左下
      [-1, 1], // 右上
      [1, -1], // 右下
    ].forEach((el) => {
      const [yAxis, xAxis] = el;

      // 石を置いた箇所からチェックを進めていく時にboardの端までチェックし終えたらチェックする処理を終了する
      if (
        currentPosition.yIndex + yAxis > 7 ||
        currentPosition.yIndex + yAxis < 0 ||
        currentPosition.xIndex + xAxis > 7 ||
        currentPosition.xIndex + xAxis < 0
      ) {
        return change;
      }

      // 石が次に進んでいく方向
      const nextPosition =
        board[currentPosition.yIndex + yAxis][currentPosition.xIndex + xAxis];

      // 石が次に進んでいく方向 にマスがない場合か、石が置いてある場合はチェックを終了する
      if (
        !nextPosition ||
        board[currentPosition.yIndex][currentPosition.xIndex]
      ) {
        return change;
      }

      // 石が次に進んでいく方向を最初は1つ隣、次のチェックで2つ隣となるので何個先をチェックするのか更新していく
      let _yAxis = yAxis;
      let _xAxis = xAxis;
      const total = [];

      // チェックする方向に置いた石と違う石があれば繰り返し処理をする
      while (
        board[currentPosition.yIndex + _yAxis][
          currentPosition.xIndex + _xAxis
        ] !== disc
      ) {
        // チェックする方向に石があるか、何も置いてない場合は石が置けないのでチェックを終了する
        if (
          board[currentPosition.yIndex + _yAxis][
            currentPosition.xIndex + _xAxis
          ] === disc ||
          board[currentPosition.yIndex + _yAxis][
            currentPosition.xIndex + _xAxis
          ] == null
        ) {
          total.splice(0);
          return total;
        }

        // // 置いた時に返る石を追加
        total.push([
          currentPosition.yIndex + _yAxis,
          currentPosition.xIndex + _xAxis,
        ]);

        // チェックを終えたらy軸とx軸を更新する
        _yAxis += yAxis;
        _xAxis += xAxis;

        // 石を置いた箇所からチェックを進めていく時にboardの端までチェックし終えたらチェックする処理を終了する
        if (
          board.length <= currentPosition.yIndex + _yAxis ||
          currentPosition.yIndex + _yAxis < 0 ||
          board.length <= currentPosition.xIndex + _xAxis
        ) {
          total.splice(0);
          return total;
        }
      }
      // 選択した箇所で相手の返る位置をchaneにpushする
      change.push(...total);
    });

    return change;
  };

  const getPutablePosition = (disc: Disc) => {
    const putList: [number, number][] = [];

    board.forEach((colItem, colIndex) => {
      colItem.forEach((_, rowIndex) => {
        const checkPosition = checkDisc(disc, {
          yIndex: colIndex,
          xIndex: rowIndex,
        });

        // 石を置いた時に1つも返らなければreturn
        if (checkPosition.length === 0) {
          return;
        }

        // 1つ以上石を返せれば配列にその位置のY軸とX軸を入れる
        putList.push([colIndex, rowIndex]);
      });
    });

    return putList;
  };

  const numberOfDiscs = useMemo(() => {
    let b = 0;
    let w = 0;
    board.forEach((colItem) => {
      colItem.forEach((square) => {
        if (square === "b") {
          b++;
        } else if (square === "w") {
          w++;
        }
      });
    });
    return { b, w };
  }, [board]);

  return {
    putDisc,
    checkDisc,
    getPutablePosition,
    board,
    setBoard,
    numberOfDiscs,
    currentPlayerDisc: playerDiscRef.current,
    isEnd,
    putablePosition,
  };
};
