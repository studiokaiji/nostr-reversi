import { Outlet } from "react-router-dom";
import { HeaderIcon } from "./Icon";

const HEADER_HEIGHT = 64;

export const Header = () => {
  return (
    <>
      <nav
        css={{
          position: "fixed",
          height: HEADER_HEIGHT,
          borderBottom: "2px solid black",
          top: 0,
          left: 0,
          width: "100%",
          padding: "0 24px",
        }}
      >
        <div
          css={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <HeaderIcon headerHeight={HEADER_HEIGHT} />
        </div>
      </nav>
      <Outlet />
    </>
  );
};
