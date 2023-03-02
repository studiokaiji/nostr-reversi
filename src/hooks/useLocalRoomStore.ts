import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useState } from "react";

export const useLocalRoomStore = (roomId: string) => {
  const data = useLiveQuery(async () => {
    return await db.rooms.get(roomId);
  });

  const [room, setLocalRoomState] = useState<Room | undefined>(data);

  const setRoom = async (room: Room) => {
    await db.rooms.put(room, room.id);
    setLocalRoomState(room);
    return room;
  };

  return { room, setRoom };
};
