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
        setOldPubkeys(pubkeys);
        setProfiles(events.map((ev) => JSON.parse(ev.content)));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [pubkeys]);

  return { profiles, isLoading };
};
