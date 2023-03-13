import { Card } from "@/components/helpers/Card";
import { useRooms } from "@/hooks/useRooms";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { nostrTimestampToDate } from "@/utils/getNostrTimestamp";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export const RoomsPage = () => {
  const { waitingRoomEvents } =
    useRooms();
  const { profiles } = useUserProfiles(
    waitingRoomEvents.map(({ pubkey }) => pubkey)
  );

  return (
    <div>
      <h2>Waiting Users</h2>
      <div css={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {waitingRoomEvents.map((ev, i) => (
          <Link to={`/rooms/${ev.id}`}>
            <Card>
              <div
                css={{
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {profiles && profiles?.[i] ? (
                  <img
                    src={profiles[i].picture || ""}
                    width={42}
                    height={42}
                    css={{ borderRadius: "2px" }}
                  />
                ) : (
                  <Skeleton width={42} height={42} borderRadius="2px" />
                )}
                <pre
                  css={{
                    maxWidth: "240px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "rgba(0,0,0,0.75)",
                    margin: 0,
                  }}
                >
                  {`/rooms/${ev.id}\n${formatDistanceToNow(
                    nostrTimestampToDate(ev.created_at)
                  )}`}
                </pre>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
