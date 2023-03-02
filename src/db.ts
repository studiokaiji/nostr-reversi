import Dexie, { Table } from "dexie";

export const SCHEMA_VERSION = 1;

export class DexieLocalRoomStore extends Dexie {
  rooms!: Table<Room>;

  constructor() {
    super("nostr-reversi-localstore");
    this.version(SCHEMA_VERSION).stores({
      rooms: "id,owner,lastUpdatedAt",
    });
  }
}

export const db = new DexieLocalRoomStore();
