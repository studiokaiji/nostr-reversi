import { Link } from "react-router-dom";

export const HeaderIcon = ({
  headerHeight,
  to = "/",
}: {
  headerHeight: number;
  to?: string;
}) => {
  return (
    <Link
      css={{
        cursor: "pointer",
        color: "black",
      }}
      to={to}
    >
      <p
        css={{
          textAlign: "left",
          marginBlock: "auto",
          lineHeight: `${headerHeight}px`,
          position: "relative",
          userSelect: "none",
        }}
      >
        <div
          css={{
            position: "absolute",
            left: -7,
            fontSize: "2rem",
            letterSpacing: "-0.25em",
          }}
        >
          ⚪️⚫️
        </div>
      </p>
    </Link>
  );
};
