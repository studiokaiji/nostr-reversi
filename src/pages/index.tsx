import { Button } from "@/components/helpers/Button";

export const IndexPage = () => {
  return (
    <div>
      <div>
        <h1 css={{ wordWrap: "break-word" }}>
          <div
            css={{
              letterSpacing: "-0.25em",
              marginRight: 20,
              userSelect: "none",
            }}
          >
            ⚪️⚫️
          </div>
          nothello
        </h1>
        <p>Reversi played on Nostr.</p>
      </div>
      <div css={{ display: "flex", gap: 10, marginTop: 40 }}>
        <Button to="/rooms/create">Create New Room</Button>
        <Button outlined to="/rooms">
          Join Room
        </Button>
      </div>
    </div>
  );
};
