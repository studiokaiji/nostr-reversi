import { useRooms } from "@/hooks/useRooms";
import { useUserProfiles } from "@/hooks/useUserProfiles";

export const RoomsPage = () => {
  const { waitingRoomEvents, isLoading: isLoadingWaitingRoomEvents } =
    useRooms();
  const { profiles, isLoading: isLoadingpProfiles } = useUserProfiles(
    waitingRoomEvents.map(({ pubkey }) => pubkey)
  );

  if (!isLoadingWaitingRoomEvents) {
  }

  return (
    <div>
      {waitingRoomEvents.map((ev) => (
        <div></div>
      ))}
    </div>
  );
};
