import { Event, Filter, Pub, relayInit, SimplePool } from "nostr-tools";

const pool = new SimplePool();

export const useRelays = (otherRelays: string[] = []) => {
  const allRelays = [
    ...JSON.parse(import.meta.env.VITE_RELAYS),
    ...otherRelays,
  ];

  const subscribe = (
    filters: Filter[],
    onEmitEventHandler?: (event: Event) => void,
    onEmitEoseEventHandler?: (offAll: () => void) => void
  ) => {
    const sub = pool.sub(allRelays, filters);

    const onEventHandler = (e: Event) => {
      onEmitEventHandler && onEmitEventHandler(e);
    };
    const onEoseHandler = () => {
      onEmitEoseEventHandler &&
        onEmitEoseEventHandler(() => {
          sub.off("event", onEventHandler);
          sub.off("eose", onEoseHandler);
        });
    };

    sub.on("event", onEventHandler);
    sub.on("eose", onEmitEoseEventHandler);
  };

  const list = async (filters: Filter[]) => {
    return pool.list(allRelays, filters);
  };

  const publish = async (
    newEvent: Event,
    onSeen?: (offAll: () => void) => void,
    onFailed?: (offAll: () => void) => void
  ) => {
    let seenCount = 0;
    let failedCount = 0;

    const pubs: Pub[] = [];

    return new Promise<boolean>((resolve, reject) => {
      const offAll = () => {
        pubs.forEach((pub) => {
          pub.off("ok", seenHandler);
          pub.off("failed", failedHandler);
        });
      };

      const seenHandler = () => {
        seenCount++;
        onSeen && onSeen(offAll);
        resolve(true);
      };

      const failedHandler = () => {
        failedCount++;
        onFailed && onFailed(offAll);
        if (failedCount >= allRelays.length) {
          offAll();
          reject("Failed to publish on all relays");
        }
      };

      allRelays.forEach((url) => {
        const relay = relayInit(url);
        relay.on("connect", () => {
          console.log("connected");
          const pub = relay.publish(newEvent);
          pub.on("ok", seenHandler);
          pub.on("failed", seenHandler);
          pubs.push(pub);
        });
        relay.on("error", () => console.error(`Can't connect to ${url}`));
        relay.connect();
      });
    });
  };

  return { subscribe, publish, allRelays, list };
};
