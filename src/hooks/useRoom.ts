import { useLocalRoomStore } from "./useLocalRoomStore";
import { useRelays } from "./useRelays";
import { CONTENT_BODY_VERSION, KIND } from "./../constants/nostr";
import { useEffect, useMemo } from "react";
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
  history: [],
};

export const createRoom = async (privateKey?: string) => {
  const { signEvent, getPublicKey } = useUserKey();

  const { publish } = useRelays();

  const unsignedEvent: UnsignedEvent = {
    kind: KIND,
    pubkey: await getPublicKey(privateKey),
    tags: [],
    content: JSON.stringify(initialContentBody),
    created_at: getNostrTimestamp(),
  };

  const event = {
    ...unsignedEvent,
    id: getEventHash(unsignedEvent),
    sig: await signEvent(unsignedEvent, privateKey),
  };

  console.log(event);

  await publish(event, (e) => console.log("aaaa", e));

  console.log("ns");

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

  const { putDisc, getPutablePosition, board, putablePosition } = useReversi();

  const put = async (put: Position) => {
    if (!room) {
      throw Error("room data is undefined.");
    }

    const ok = putDisc(put);
    if (!ok) throw 0;

    const publicKey = await getPublicKey();
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
      history: room.history,
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
      console.log("hiiii");
      // gameが始まっていない場合
      return setRoom({
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
        history: [],
      });
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
      history: [],
    };

    return setRoom(room);
  };

  const listenUpdate = async (since: Date) => {
    const events: Event[] = [];

    subscribe(
      [
        {
          "#e": [roomId],
          kinds: [KIND],
          since: getNostrTimestamp(since),
        },
      ],
      (ev) => {
        if (!events.find(({ id }) => ev.id === id)) {
          events.push(ev);
        }
      }
    );

    setInterval(() => {
      if (!events.length || !room) return;

      events.forEach(async (e) => {
        const tags = parseTags(e.tags);

        const latestEventId = tags["e"][1];

        if (room.latestEventId !== latestEventId) {
          return;
        }

        const body = JSON.parse(e.content) as GameContentBody;

        if (room.isGameStarted && body.kind === 1 && body.put.length) {
          // Put event
          const ok = putDisc({
            xIndex: body.put[0],
            yIndex: body.put[1],
          });
          if (!ok) return;

          const newRoom: Room = {
            ...room,
            currentPlayer: e.pubkey,
            lastUpdatedAt: nostrTimestampToDate(e.created_at),
            history: [...room.history, body.put],
          };

          return setRoom(newRoom);
        }

        if (!room.isGameStarted && body.kind === 0) {
          // JoinRequest and AcceptJoinRequest event
          const eTags = tags["e"];

          if (
            eTags.length === 1 &&
            eTags[0] === roomId &&
            room.owner !== e.pubkey
          ) {
            // JoinRequest
            const joinApplicants = [
              ...new Set(room.joinApplicants).add(e.pubkey),
            ];

            const newRoom: Room = {
              ...room,
              joinApplicants,
              latestEventId: e.id || "",
              lastUpdatedAt: nostrTimestampToDate(e.created_at),
            };

            return setRoom(newRoom);
          }

          if (
            eTags.length > 1 &&
            eTags[0] === roomId &&
            room.owner === e.pubkey
          ) {
            // AcceptJoinRequest
            const opponentPublicKey = tags["p"][0];
            if (opponentPublicKey && opponentPublicKey !== room.owner && e.id) {
              await acceptJoinRequest(e.id, opponentPublicKey);

              const newRoom: Room = {
                ...room,
                isGameStarted: true,
                players: {
                  b: room.owner,
                  w: e.pubkey,
                },
                latestEventId: e.id,
                lastUpdatedAt: nostrTimestampToDate(e.created_at),
              };

              return setRoom(newRoom);
            }
          }
        }
      });
    }, 100);
  };

  const { data: room, setRoom } = useLocalRoomStore(roomId);

  useEffect(() => {
    if (!window || !roomId) {
      return;
    }
    console.log("a");
    const handler = () => {
      console.log("aag");
      getCurrentData(room?.lastUpdatedAt).then((room) => {
        if (!room) return;
        listenUpdate(room.lastUpdatedAt);
      });
    };
    window.addEventListener("load", handler);
    return () => window.removeEventListener("load", handler);
  }, [window, roomId]);

  const currentDisc: Disc = useMemo(() => {
    if (!room) return "b";
    return room.currentPlayer === room.owner ? "b" : "w";
  }, [room]);

  return { joinRequest, put, room, board, putablePosition, currentDisc };
};
