# Nothello (Reversi on Nostr) Flow

**This document is work in progress. Information is probably outdated.**

## Overview

All Nothello event uses `kind: 6464`.

### Payload

- `version`: Payload version
- `kind`: Event identifier for Nothello, not related to Nostr's kind. `0` for events before the game starts, `1` for events during the game.
- `put`: If the game is in progress, the position of the disc placed by the user is recorded. (If x: 5, y: 3, then [5, 3] will be assigned.)
- `boardState`: A string that represents the current state of the board.

```json
{
  "version": "0",
  "boardState": "000000000000000000000000000bbb00000bw00000000000000000000000000",
  "kind": 1,
  "put": [5, 3]
}
```

Nothello payload is stored as a string in the content of the Nostr event.

```json
{
  "id": "00bbb639f0e2c26b984270084a61daf9e0bbbd2f5b82bc06a331452e34656d16",
  "pubkey": "2d417bce8c10883803bc427703e3c4c024465c88e7063ed68f9dfeecf56911ac",
  "created_at": 1678720761,
  "kind": 6464,
  "tags": [
    [
      "e",
      "367be58adfc021389f433f87551e07c3c9f69b4973b5fef167d250012b65f5f3",
      "wss://nothello-relay.studiokaiji.com",
      "54b845df3b2ad5cddb68d28dfe5a32f8148479c8ecdd77da625077b02dbe6c51"
    ],
    ["p", "d6737a587bf046e588539fb2b63b45a6e05b7940fd9e4f9f44fac2d082a757bc"]
  ],
  "content": "{\"version\":\"0\",\"boardState\":\"000000000000000000000000000bbb00000bw000000000000000000000000000\",\"kind\":1,\"put\":[5,3]}",
  "sig": "5248362fcc54c9d912063bb475052115ec1444e2972aba6293c91b98045c1330de2a9da6ba033a3bca4850359b3536079ac371a473e4a7872e49189675c85ec4"
}
```

## Before Game Start

Before starting a game, three events must be executed.

1. `createRoom`
   create game room. A room creation event is issued only once, `4669c3a8f4de837bd899f7069591978fa7c5d96caa7c7c1507a6678332543cc2`(open room tag) must be included in the `e` tag.
2. `joinRequest`
   Join request. The request must be made by someone other than the room creator.
   `roomId` (= `createRoom` event id) must be included in the `e` tag.
3. `acceptJoinRequest`
   Event in which the room creator accepts the `joinRequest` event.
   `roomId` and the ID of the `joinRequest` event to approve must be included in the `e` tag. `p` tag must contain the opponent's public key.

## During A Game

Events in the game are called `put` events.
`roomId` and the ID of the `joinRequest` event to approve must be included in the `e` tag. `p` tag must contain the opponent's public key.

```json
{
  "id": "00bbb639f0e2c26b984270084a61daf9e0bbbd2f5b82bc06a331452e34656d16",
  "pubkey": "2d417bce8c10883803bc427703e3c4c024465c88e7063ed68f9dfeecf56911ac",
  "created_at": 1678720761,
  "kind": 6464,
  "tags": [
    [
      "e",
      "367be58adfc021389f433f87551e07c3c9f69b4973b5fef167d250012b65f5f3", // Room ID
      "wss://nothello-relay.studiokaiji.com",
      "54b845df3b2ad5cddb68d28dfe5a32f8148479c8ecdd77da625077b02dbe6c51" // Last event id
    ],
    ["p", "d6737a587bf046e588539fb2b63b45a6e05b7940fd9e4f9f44fac2d082a757bc"] // opponent's public key
  ],
  "content": "{\"version\":\"0\",\"boardState\":\"000000000000000000000000000bbb00000bw000000000000000000000000000\",\"kind\":1,\"put\":[5,3]}",
  "sig": "5248362fcc54c9d912063bb475052115ec1444e2972aba6293c91b98045c1330de2a9da6ba033a3bca4850359b3536079ac371a473e4a7872e49189675c85ec4"
}
```
