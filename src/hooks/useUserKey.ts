import {
  getPublicKey as nostrGetPublicKey,
  signEvent as nostrSignEvent,
  UnsignedEvent,
} from "nostr-tools";

export const useUserKey = () => {
  const getPublicKey = async (secretKey?: string): Promise<string> => {
    if (secretKey) {
      return nostrGetPublicKey(secretKey);
    }
    return (globalThis as any).nostr.getPublicKey();
  };

  const signEvent = async (
    event: UnsignedEvent,
    secretKey?: string
  ): Promise<string> => {
    if (secretKey) {
      return nostrSignEvent(event, secretKey);
    }
    const { sig } = await (globalThis as any).nostr.signEvent(event);
    return sig;
  };

  return { getPublicKey, signEvent };
};
