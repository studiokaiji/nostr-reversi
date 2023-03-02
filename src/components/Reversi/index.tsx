import { Row } from "./Row";

const rowArr = [0, 1, 2, 3, 4, 5, 6, 7];

type ReversiProps = {
  player: Disc;
  disabled: boolean;
  board: Board;
  putablePosition: number[][];
  onClickSquare: (position: Position) => void;
};

export const Reversi = ({
  disabled,
  board,
  putablePosition,
  onClickSquare,
}: ReversiProps) => {
  return (
    <div
      css={{
        display: "inline-block",
        border: "0.5px solid black",
        pointerEvents: disabled ? "none" : "auto",
        position: "relative",
      }}
    >
      <div
        css={{
          background: "rgba(256,256,256,0.4)",
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />
      {rowArr.map((row) => (
        <Row
          key={row}
          row={row}
          board={board}
          array={rowArr}
          isPutableDisc={putablePosition}
          onClick={onClickSquare}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
