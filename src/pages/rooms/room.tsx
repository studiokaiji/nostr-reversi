import { createRoom, useRoom } from "@/hooks/useRoom";
import { useUserKey } from "@/hooks/useUserKey";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Reversi } from "@/components/Reversi";

export const RoomPage = () => {
  const { roomId } = useParams();

  const { joinRequest, room, board, putablePosition, currentDisc, put } =
    useRoom(roomId);

  const { getPublicKey } = useUserKey();
  const [publicKey, setPublicKey] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!window) {
      return;
    }

    const handler = () => {
      if (!roomId) {
        createRoom().then((ev) => {
          console.log("hi");
          navigate(`/rooms/${ev.id}`);
        });
      }
    };

    window.addEventListener("load", handler);
    return () => window.removeEventListener("load", handler);
  }, [window]);

  useEffect(() => {
    if (!room) return;
    console.log("room", room);
    getPublicKey().then(async (pubKey) => {
      setPublicKey(pubKey);
      if (!room.isGameStarted && pubKey !== room.owner) {
        await joinRequest();
      }
    });
  }, [room]);

  if (!room) {
    if (!roomId) {
      return <div>Creating</div>;
    } else {
      return <div>Joining</div>;
    }
  }

  return (
    <div>
      <div>
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
        <p>Reversi working on Nostr.</p>
      </div>
      <div>{}</div>
      <div
        css={{
          marginTop: "3rem",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <pre css={{ textAlign: "left" }}>
          Room: {JSON.stringify(room, null, 2)}
        </pre>
        <div>Disc: {currentDisc}</div>
        <div css={{ margin: "0 auto" }}>
          <Reversi
            player={currentDisc}
            disabled={!room || room.currentPlayer !== ""}
            board={board}
            putablePosition={putablePosition}
            onClickSquare={(pos) => put(pos)}
          />
        </div>
      </div>
    </div>
  );
};
