import { RELAYS_FOR_PROFILE } from "./../constants/nostr";
import { useState } from "react";
import { useOnReadyNostrClient } from "@/hooks/useOnReadyNostrClient";
import { useRelays } from "./useRelays";

export const useUserProfiles = (pubkeys: string[] = []) => {
  const { list } = useRelays(RELAYS_FOR_PROFILE);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [oldPubkeys, setOldPubkeys] = useState<string[]>([]);

  useOnReadyNostrClient(() => {
    if (
      !pubkeys ||
      !pubkeys.length ||
      JSON.stringify(oldPubkeys) === JSON.stringify(pubkeys)
    ) {
      return;
    }

    setIsLoading(true);

    list([
      {
        authors: pubkeys,
        kinds: [0],
      },
    ])
      .then((events) => {
        const sortedEvents = pubkeys.map((pubkey) =>
          events.find((ev) => ev.pubkey === pubkey)
        );
        setOldPubkeys(pubkeys);
        setProfiles(
          sortedEvents.map((ev) => {
            if (!ev) return null;
            return JSON.parse(ev.content);
          })
        );
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [pubkeys]);

  return { profiles, isLoading };
};
