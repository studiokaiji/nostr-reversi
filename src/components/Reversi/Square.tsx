import { Disc } from "../helpers/Disc";

type SquareProps = {
  value: Disc | null;
  isPutableDisc: boolean;
} & Omit<JSX.IntrinsicElements["button"], "value">;

export const Square = (props: SquareProps) => {
  return (
    <button
      {...props}
      css={{
        width: 40,
        height: 40,
        backgroundColor: `rgba(0,128,0,${
          props.isPutableDisc && !props.disabled ? "0.7" : "1"
        })`,
        padding: 0,
        display: "inline-block",
        border: "0.5px solid black",
        ":hover": {
          backgroundColor:
            props.value || !props.isPutableDisc || props.disabled
              ? ""
              : `rgba(0,128,0,0.5)`,
        },
      }}
      value={undefined}
    >
      <div css={{ margin: 4 }}>
        {props.value ? (
          <Disc color={props.value} />
        ) : (
          <div css={{ width: 30, height: 30 }} />
        )}
      </div>
    </button>
  );
};
