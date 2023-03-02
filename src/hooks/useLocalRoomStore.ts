import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export const useLocalRoomStore = (roomId: string) => {
  const data = useLiveQuery(async () => {
    return await db.rooms.get(roomId);
  });

  const setRoom = async (room: Room) => {
    await db.rooms.add(room, room.id);
    return room;
  };

  return { data, setRoom };
};
