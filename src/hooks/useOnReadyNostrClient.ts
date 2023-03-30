import { useEffect } from "react";

export const useOnReadyNostrClient = (
  effect: React.EffectCallback,
  deps: React.DependencyList = [],
  onDoesNotExist?: () => void
) => {
  useEffect(() => {
    if (!window) {
      return;
    }

    let isCalledHandler = false;

    const handler = () => {
      if (isCalledHandler) {
        return;
      }
      if ((window as any).nostr) {
        effect();
      } else {
        onDoesNotExist && onDoesNotExist();
      }
    };

    if ((window as any).nostr) {
      handler();
    } else {
      window.addEventListener("load", handler);
      return () => window.removeEventListener("load", handler);
    }
  }, [window, ...deps]);
};
