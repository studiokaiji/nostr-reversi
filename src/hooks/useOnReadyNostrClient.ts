import { useEffect } from "react";

export const useOnReadyNostrClient = (
  effect: React.EffectCallback,
  deps: React.DependencyList = []
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
      effect();
    };

    if ((window as any).nostr) {
      handler();
    } else {
      window.addEventListener("load", handler);
      return () => window.removeEventListener("load", handler);
    }
  }, [window, ...deps]);
};
