declare global {
  interface Window {
    nostr: {
      getPublicKey: () => void;
      signEvent: (event: Event) => Event;
    };
  }
}
