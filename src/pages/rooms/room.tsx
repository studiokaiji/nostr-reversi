import { createRoom, useRoom } from "@/hooks/useRoom";
import { useUserKey } from "@/hooks/useUserKey";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Reversi } from "@/components/Reversi";
import { useOnReadyNostrClient } from "@/hooks/useOnReadyNostrClient";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { ProfileCard } from "@/components/helpers/ProfileCard";
import { nip19 } from "nostr-tools";
import { CopyShareUrl } from "@/components/helpers/CopyShereUrl";

export const RoomPage = () => {
  const { roomId } = useParams();

  const {
    joinRequest,
    room,
    board,
    putablePosition,
    currentPlayerDisc,
    put,
    numberOfDiscs,
  } = useRoom(roomId);

  const { getPublicKey } = useUserKey();
  const [publicKey, setPublicKey] = useState("");

  const publicKeys = useMemo(
    () => Object.values(room?.players || []).filter((v) => v),
    [room?.players]
  );

  const { profiles, isLoading: isLoadingProfile } = useUserProfiles(publicKeys);

  const navigate = useNavigate();

  useOnReadyNostrClient(() => {
    getPublicKey().then(setPublicKey);
    if (!roomId) {
      createRoom().then((ev) => {
        navigate(`/rooms/${ev.id}`);
      });
    }
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
      <div>{}</div>
      <div
        css={{
          marginTop: "3rem",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          css={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            fontWeight: 500,
            margin: "0 auto",
          }}
        >
          {room?.players.b && (
            <ProfileCard
              profile={profiles[0]}
              npub={nip19.npubEncode(room?.players.b)}
              disc="b"
              numberOfDisc={numberOfDiscs.b}
            />
          )}
          {room?.players.w && (
            <>
              <p>VS</p>
              <ProfileCard
                profile={profiles[1]}
                npub={nip19.npubEncode(room?.players.w)}
                disc="w"
                numberOfDisc={numberOfDiscs.w}
              />
            </>
          )}
        </div>
        <div>Disc: {currentPlayerDisc === "b" ? "●" : "○"}</div>
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
        <CopyShareUrl url={location.href} />
      </div>
    </div>
  );
};
