import { Square } from "./Square";

type RowProps = {
  array: number[];
  board: Board;
  row: number;
  isPutableDisc: number[][];
  onClick: (position: Position) => void;
  disabled: boolean;
};

export const Row = ({
  array,
  board,
  row,
  isPutableDisc,
  onClick,
  disabled,
}: RowProps) => {
  return (
    <div
      css={{
        height: 40,
        width: 40 * 8,
        margin: "0 auto",
      }}
    >
      {array.map((index) => {
        let isPutable = false;
        for (const el of isPutableDisc) {
          isPutable = el[0] === row && el[1] === index;
          if (isPutable) break;
        }
        return (
          <Square
            value={board[row][index]}
            isPutableDisc={isPutable}
            onClick={() =>
              onClick({
                yIndex: row,
                xIndex: index,
              })
            }
            disabled={disabled}
          />
        );
      })}
    </div>
  );
};
