import { css } from "@emotion/react";

type SquareProps = {
  value: Disc | null;
  isPutableDisc: boolean;
} & Omit<JSX.IntrinsicElements["button"], "value">;

const discCss = css({
  width: 30,
  height: 30,
  borderRadius: "50%",
  margin: 4,
});

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
      {props.value === "b" ? (
        <div css={[discCss, { backgroundColor: "#000" }]} />
      ) : props.value === "w" ? (
        <div css={[discCss, { backgroundColor: "#fff" }]} />
      ) : (
        <div css={discCss} />
      )}
    </button>
  );
};
