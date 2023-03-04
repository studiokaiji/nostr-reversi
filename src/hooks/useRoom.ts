import { sha256 } from "./../utils/sha256";
import { useOnReadyNostrClient } from "./useOnReadyNostrClient";
import { useLocalRoomStore } from "./useLocalRoomStore";
import { useRelays } from "./useRelays";
import {
  CONTENT_BODY_VERSION,
  CREATE_ROOM_E_TAG,
  KIND,
} from "./../constants/nostr";
import { useEffect, useRef } from "react";
import { Event, getEventHash, UnsignedEvent } from "nostr-tools";
import { useUserKey } from "./useUserKey";
import {
  getNostrTimestamp,
  nostrTimestampToDate,
} from "@/utils/getNostrTimestamp";
import { formatBoardState } from "@/utils/boardStateConverter";
import { useReversi } from "./useReversi";
import { parseTags } from "@/utils/tagsParser";

const initialContentBody: GameContentBody = {
  version: CONTENT_BODY_VERSION,
  kind: 0,
  put: [],
  boardState: formatBoardState(),
};

export const createRoom = async (privateKey?: string) => {
  const { signEvent, getPublicKey } = useUserKey();

  const { publish } = useRelays();

  const unsignedEvent: UnsignedEvent = {
    kind: KIND,
    pubkey: await getPublicKey(privateKey),
    tags: [["e", CREATE_ROOM_E_TAG]],
    content: JSON.stringify(initialContentBody),
    created_at: getNostrTimestamp(),
  };

  const event = {
    ...unsignedEvent,
    id: getEventHash(unsignedEvent),
    sig: await signEvent(unsignedEvent, privateKey),
  };

  await publish(event);

  return event;
};

export const useRoom = (roomId = "", privateKey?: string) => {
  const { signEvent, getPublicKey } = useUserKey();

  const { subscribe, publish, list } = useRelays();

  const joinRequest = async (): Promise<Event> => {
    const unsignedEvent: UnsignedEvent = {
      kind: KIND,
      pubkey: await getPublicKey(privateKey),
      tags: [["e", roomId]],
      content: JSON.stringify(initialContentBody),
      created_at: getNostrTimestamp(),
    };

    const event = {
      ...unsignedEvent,
      id: getEventHash(unsignedEvent),
      sig: await signEvent(unsignedEvent, privateKey),
    };

    await publish(event);

    return event;
  };

  const acceptJoinRequest = async (
    requestId: string,
    opponentPublicKey: string
  ) => {
    const unsignedEvent: UnsignedEvent = {
      kind: KIND,
      pubkey: await getPublicKey(privateKey),
      tags: [
        ["e", roomId, requestId],
        ["p", opponentPublicKey],
      ],
      content: JSON.stringify(initialContentBody),
      created_at: getNostrTimestamp(),
    };

    const event = {
      ...unsignedEvent,
      id: getEventHash(unsignedEvent),
      sig: await signEvent(unsignedEvent, privateKey),
    };

    await publish(event);

    return event;
  };

  const {
    putDisc,
    getPutablePosition,
    numberOfDiscs,
    board,
    putablePosition,
    currentPlayerDisc,
  } = useReversi();

  const put = async (put: Position) => {
    if (!room) {
      throw Error("room data is undefined.");
    }

    const publicKey = await getPublicKey();

    const ok = putDisc(put);
    if (!ok) throw 0;

    const opponentPublicKey =
      room.players[
        (Object.keys(room?.players) as Disc[]).filter(
          (k) => room.players[k] !== publicKey
        )[0]
      ];

    const contentBody: GameContentBody = {
      version: CONTENT_BODY_VERSION,
      boardState: formatBoardState(board),
      kind: 1,
      put: [put.xIndex, put.yIndex],
    };

    const unsignedEvent: UnsignedEvent = {
      kind: KIND,
      pubkey: await getPublicKey(privateKey),
      tags: [
        ["e", roomId, room.latestEventId],
        ["p", opponentPublicKey],
      ],
      content: JSON.stringify(contentBody),
      created_at: getNostrTimestamp(),
    };

    const event = {
      ...unsignedEvent,
      id: getEventHash(unsignedEvent),
      sig: await signEvent(unsignedEvent, privateKey),
    };

    const newRoom: Room = {
      ...room,
      isGameStarted: true,
      currentPlayer: opponentPublicKey,
      latestEventId: event.id,
      lastUpdatedAt: nostrTimestampToDate(event.created_at),
    };

    isGameStartedRef.current = true;

    setRoom(newRoom);

    await publish(event);

    return event;
  };

  const getCurrentData = async (since: Date = new Date(0)) => {
    const initialEvent = (
      await list([
        {
          ids: [roomId],
        },
      ])
    )[0];

    const events = await list([
      {
        "#e": [roomId],
        kinds: [KIND],
        since: getNostrTimestamp(since),
      },
    ]);

    const gameContentBodyMap = events.reduce<{ [id: string]: GameContentBody }>(
      (prev, { content, id }) => {
        if (id) {
          prev[id] = JSON.parse(content);
        }
        return prev;
      },
      {}
    );

    let acceptedOpponentPublicKey = "";
    const joinRequestEvents: Event[] = [];

    let gamePutEvents: Event[] = [];

    events.forEach((ev) => {
      const id = ev.id;
      if (!id) return;

      const tags = parseTags(ev.tags);
      const body = gameContentBodyMap[id];

      const eTags = tags["e"];

      if (body.kind === 0) {
        // join request event
        if (
          eTags.length === 1 &&
          eTags[0] === roomId &&
          initialEvent.pubkey !== ev.pubkey
        ) {
          joinRequestEvents.push(ev);
          return;
        }

        // accept event
        if (
          tags["p"] &&
          eTags.length > 1 &&
          eTags[0] === roomId &&
          initialEvent.pubkey === ev.pubkey
        ) {
          acceptedOpponentPublicKey = tags["p"][0];
          return;
        }
      } else {
        gamePutEvents.push(ev);
      }
    });

    gamePutEvents = gamePutEvents.filter(
      (ev) =>
        ev.pubkey === initialEvent.pubkey ||
        ev.pubkey === acceptedOpponentPublicKey
    );

    const joinApplicants = joinRequestEvents.map(({ pubkey }) => pubkey);

    if (!gamePutEvents.length) {
      // gameが始まっていない場合
      const roomData = {
        id: initialEvent.id,
        players: {
          b: initialEvent.pubkey,
          w: acceptedOpponentPublicKey,
        },
        isGameStarted: false,
        currentPlayer: initialEvent.pubkey,
        lastUpdatedAt: nostrTimestampToDate(initialEvent.created_at),
        joinApplicants,
        owner: initialEvent.pubkey,
        latestEventId: initialEvent.id,
      };

      isGameStartedRef.current = false;

      setRoom(roomData);
      return roomData;
    }

    let isAssignednextCheckPutEvent = false;

    let nextCheckPutEvent: Event = gamePutEvents[0];

    const idToPutEventMap: { [id: string]: Event } = {};

    for (const putEv of gamePutEvents) {
      const eTags = putEv.tags.filter((tagList) => tagList[0] === "e")[0];

      // 最初のputEvent(tag: eのlengthが一つかつルームオーナーが投稿したノートの場合)を取得
      if (
        eTags.length < 2 &&
        eTags[0] &&
        putEv.pubkey === initialEvent.pubkey
      ) {
        nextCheckPutEvent = putEv;
      }
      isAssignednextCheckPutEvent = true;
      idToPutEventMap[putEv.id] = putEv;
    }

    if (!isAssignednextCheckPutEvent) throw Error("Does not first put event.");

    const checkedPutEvents = [];
    let lastCheckedPutEventDisc: Disc = "b";
    let lastCheckPassedPutEvent: Event = gamePutEvents[0];

    const hitsory: number[][] = [];

    while (checkedPutEvents.length <= gamePutEvents.length) {
      const id = nextCheckPutEvent.id;

      const disc = nextCheckPutEvent.pubkey === initialEvent.pubkey ? "b" : "w";

      const body = gameContentBodyMap[id];

      if (
        body.put.length &&
        // 同じユーザーが連続で石を置く場合は、対戦相手の石が置けないことを確認する
        (lastCheckedPutEventDisc !== disc ||
          getPutablePosition(disc === "b" ? "w" : "b").length < 1)
      ) {
        const ok = putDisc({
          xIndex: body.put[0],
          yIndex: body.put[1],
        });
        if (ok) {
          lastCheckPassedPutEvent = nextCheckPutEvent;
          hitsory.push(body.put);
        }
      }

      // チェック済みであることをマーク
      lastCheckedPutEventDisc = disc;
      checkedPutEvents.push(nextCheckPutEvent);

      // 次のイベントを取得・追加
      const eTags = nextCheckPutEvent.tags.filter(
        (tagList) => tagList[0] === "e"
      )[0];
      const nextPutEventId = eTags[1];
      nextCheckPutEvent = idToPutEventMap[nextPutEventId];
    }

    const currentPlayer = lastCheckPassedPutEvent
      ? lastCheckPassedPutEvent.pubkey
      : initialEvent.pubkey;

    const latestGamePutEventCreatedAt = lastCheckPassedPutEvent
      ? lastCheckPassedPutEvent.created_at
      : 0;

    const room: Room = {
      id: initialEvent.id,
      players: {
        b: initialEvent.pubkey,
        w: acceptedOpponentPublicKey,
      },
      isGameStarted: !!gamePutEvents.length,
      currentPlayer,
      lastUpdatedAt: nostrTimestampToDate(latestGamePutEventCreatedAt),
      joinApplicants,
      owner: initialEvent.pubkey,
      latestEventId: lastCheckPassedPutEvent.id,
    };

    isGameStartedRef.current = !!gamePutEvents.length;

    return setRoom(room);
  };

  const listenUpdate = async (since: Date, currentRoom: Room) => {
    const events: Event[] = [];

    if (room) {
      currentRoom = room;
    }

    const myPubkey = await getPublicKey();

    subscribe(
      [
        {
          "#e": [roomId],
          kinds: [KIND],
          since: getNostrTimestamp(since),
        },
      ],
      async (e) => {
        if (!events.find(({ id }) => e.id === id)) {
          console.log("NEW EVENT", e);
          const tags = parseTags(e.tags);
          if (!tags || !tags["e"] || !tags["e"][0]) {
            return;
          }

          const body = JSON.parse(e.content) as GameContentBody;

          if (
            isGameStartedRef.current &&
            body.kind === 1 &&
            body.put.length &&
            e.pubkey !== myPubkey
          ) {
            // Put event
            const ok = putDisc({
              xIndex: body.put[0],
              yIndex: body.put[1],
            });
            if (!ok) {
              console.error("Don't accept oppotunity put event");
              return;
            }

            const opponentPublicKey = e.pubkey;

            const newRoom: Room = {
              ...currentRoom,
              latestEventId: e.id,
              currentPlayer: myPubkey,
              lastUpdatedAt: nostrTimestampToDate(e.created_at),
              isGameStarted: true,
              players: {
                b: currentRoom.owner,
                w:
                  opponentPublicKey === currentRoom.owner
                    ? myPubkey
                    : opponentPublicKey,
              },
            };

            return setRoom(newRoom);
          }

          if (!isGameStartedRef.current && body.kind === 0) {
            // JoinRequest and AcceptJoinRequest event
            const eTags = tags["e"];

            if (
              eTags.length === 1 &&
              eTags[0] === roomId &&
              currentRoom.owner !== e.pubkey
            ) {
              // JoinRequest
              const joinApplicants = [
                ...new Set(currentRoom.joinApplicants).add(e.pubkey),
              ];

              const newRoom: Room = {
                ...currentRoom,
                joinApplicants,
                latestEventId: e.id || "",
                lastUpdatedAt: nostrTimestampToDate(e.created_at),
              };

              setRoom(newRoom);

              await acceptJoinRequest(e.id, e.pubkey);

              return room;
            }

            if (
              eTags.length > 1 &&
              eTags[0] === roomId &&
              currentRoom.owner === e.pubkey
            ) {
              // AcceptJoinRequest
              const opponentPublicKey = tags["p"][0];
              if (
                opponentPublicKey &&
                opponentPublicKey !== currentRoom.owner &&
                e.id
              ) {
                const newRoom: Room = {
                  ...currentRoom,
                  isGameStarted: true,
                  players: {
                    b: currentRoom.owner,
                    w: opponentPublicKey,
                  },
                  latestEventId: e.id,
                  lastUpdatedAt: nostrTimestampToDate(e.created_at),
                };

                isGameStartedRef.current = true;

                return setRoom(newRoom);
              }
            }
          }
        }
      }
    );
  };

  const { room, setRoom } = useLocalRoomStore(roomId);
  const isGameStartedRef = useRef(false);

  useOnReadyNostrClient(() => {
    if (!roomId) {
      return;
    }
    getCurrentData(room?.lastUpdatedAt).then((room) => {
      if (!room) return;
      listenUpdate(room.lastUpdatedAt, room);
    });
  }, [roomId]);

  return {
    joinRequest,
    put,
    room,
    board,
    putablePosition,
    currentPlayerDisc,
    numberOfDiscs,
  };
};
