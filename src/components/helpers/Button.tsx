import { Link, LinkProps } from "react-router-dom";

export const Button = <T extends string | undefined>(
  props: (T extends string
    ? Omit<LinkProps, "to">
    : JSX.IntrinsicElements["button"]) & {
    outlined?: boolean;
    to?: T;
  }
) => {
  const css = {
    border: "2px solid black",
    outline: "none",
    cursor: "pointer",
    backgroundColor: props.outlined ? "white" : "black",
    padding: "0.7rem 1.4rem",
    fontSize: "1rem",
    fontWeight: 600,
    color: props.outlined ? "black" : "white",
    ":hover": {
      backgroundColor: props.outlined ? "rgba(0,0,0,0.075)" : "#3ac779",
      color: props.outlined ? "black" : "white",
    },
    transitionProperty: "all",
    transitionDuration: "200ms",
  };

  if (typeof props.to === "string") {
    return (
      <Link css={css} {...(props as LinkProps)}>
        {props.children}
      </Link>
    );
  }

  return (
    <button
      css={[
        css,
        {
          WebkitAppearance: "none",
          MozAppearance: "none",
          appearance: "none",
          userSelect: "none",
        },
      ]}
      {...(props as JSX.IntrinsicElements["button"])}
    >
      {props.children}
    </button>
  );
};
