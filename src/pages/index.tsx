import { Button } from "@/components/helpers/Button";

export const IndexPage = () => {
  return (
    <div css={{ display: "flex", gap: 10, marginTop: 40 }}>
      <Button to="/rooms/create">Create New Room</Button>
      <Button outlined to="/rooms">
        Join Room
      </Button>
    </div>
  );
};
