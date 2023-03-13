import { CREATE_ROOM_E_TAG, KIND } from "@/constants/nostr";
import { useOnReadyNostrClient } from "@/hooks/useOnReadyNostrClient";
import { getNostrTimestamp } from "@/utils/getNostrTimestamp";
import { Event } from "nostr-tools";
import { useState } from "react";
import { useRelays } from "./useRelays";

export const useRooms = (timeLimitSec: number = 60 * 30) => {
  const { list } = useRelays();

  const [waitingRoomEvents, setWaitingRoomEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useOnReadyNostrClient(() => {
    list([
      {
        since: getNostrTimestamp() - timeLimitSec,
        kinds: [KIND],
        "#e": [CREATE_ROOM_E_TAG],
      },
    ])
      .then(async (createRoomEvents) => {
        const createRoomEventIds = createRoomEvents.map(({ id }) => id);
        const acceptedEvents = await list([
          {
            since: getNostrTimestamp() - timeLimitSec,
            kinds: [KIND],
            "#e": createRoomEventIds,
          },
        ]);

        const waitingEvents = createRoomEvents.filter(
          ({ id }) => acceptedEvents.findIndex((ev) => id !== ev.id) === -1
        );
        setWaitingRoomEvents(waitingEvents);

        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  return { waitingRoomEvents, isLoading };
};
