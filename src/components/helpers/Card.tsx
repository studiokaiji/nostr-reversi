import { Interpolation, Theme } from "@emotion/react";

export const Card = (
  props: JSX.IntrinsicElements["div"] & { css?: Interpolation<Theme> }
) => (
  <div
    {...props}
    css={[
      {
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
        padding: "12px",
        display: "flex",
        gap: "7px",
        alignItems: "center",
        borderRadius: "3px",
      },
      props.css,
    ]}
  ></div>
);
