import { RELAYS_FOR_PROFILE } from "./../constants/nostr";
import { useState } from "react";
import { useOnReadyNostrClient } from "@/hooks/useOnReadyNostrClient";
import { useRelays } from "./useRelays";

export const useUserProfiles = (pubkeys: string[] = []) => {
  const { list } = useRelays(RELAYS_FOR_PROFILE);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useOnReadyNostrClient(() => {
    if (!pubkeys || !pubkeys.length) return;
    try {
      setIsLoading(true);
      list([
        {
          authors: pubkeys,
          kinds: [0],
        },
      ]).then((events) => {
        setProfiles(events.map((ev) => JSON.parse(ev.content)));
      });
    } catch (e) {
      setIsLoading(false);
    }
  }, [pubkeys]);

  return { profiles, isLoading };
};
