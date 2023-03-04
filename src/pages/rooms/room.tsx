import { createRoom, useRoom } from "@/hooks/useRoom";
import { useUserKey } from "@/hooks/useUserKey";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Reversi } from "@/components/Reversi";
import { NothelloLogo } from "@/components/helpers/NothelloLogo";

export const RoomPage = () => {
  const { roomId } = useParams();

  const { joinRequest, room, board, putablePosition, currentPlayerDisc, put } =
    useRoom(roomId);

  const { getPublicKey } = useUserKey();
  const [publicKey, setPublicKey] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!window) {
      return;
    }

    const handler = () => {
      getPublicKey().then(setPublicKey);
      if (!roomId) {
        createRoom().then((ev) => {
          navigate(`/rooms/${ev.id}`);
        });
      }
    };

    if ((window as any).nostr) {
      handler();
    }

    window.addEventListener("load", handler);
    return () => window.removeEventListener("load", handler);
  }, [window, roomId]);

  const [joinRequestStatus, setJoinRequestStatus] = useState<
    "sending" | "sent"
  >();

  useEffect(() => {
    if (!room || !publicKey || joinRequestStatus === "sent") return;
    if (!room.isGameStarted && publicKey !== room.owner) {
      setJoinRequestStatus("sending");
      joinRequest().then(() => setJoinRequestStatus("sent"));
    }
  }, [room, publicKey]);

  if (!room) {
    if (!roomId) {
      return <div>Creating</div>;
    } else {
      return <div>Joining</div>;
    }
  }

  if (joinRequestStatus === "sending") {
    return <div>Sending Join Request...</div>;
  }

  return (
    <div>
      <NothelloLogo />
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
        <div>Disc: {currentPlayerDisc}</div>
        <div css={{ margin: "0 auto" }}>
          <Reversi
            player={currentPlayerDisc}
            disabled={
              !room || !room.isGameStarted || room.currentPlayer !== publicKey
            }
            board={board}
            putablePosition={putablePosition}
            onClickSquare={(pos) => put(pos)}
          />
        </div>
      </div>
    </div>
  );
};
