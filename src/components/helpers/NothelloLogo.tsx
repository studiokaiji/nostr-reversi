import { Link, Outlet } from "react-router-dom";

export const NothelloLogo = () => (
  <>
    <Link css={{ userSelect: "none", color: "black" }} to="/">
      <div css={{ display: "inline-flex", flexDirection: "column" }}>
        <h1 css={{ wordWrap: "break-word" }}>
          <div
            css={{
              letterSpacing: "-0.25em",
              marginRight: 20,
            }}
          >
            ⚪️⚫️
          </div>
          nothello
        </h1>
        <p
          css={{
            display: "inline",
          }}
        >
          Reversi working on Nostr.
        </p>
      </div>
    </Link>
    <Outlet />
  </>
);
