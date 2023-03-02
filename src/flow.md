# Nothello (Reversi on Nostr) Flow

**This document is work in progress. Information is probably outdated.**

## Overview

All Nothello event uses `kind: 64`.

### Payload

- `version`: Payload version
- `kind`: Event identifier for Nothello, not related to Nostr's kind. `0` for events before the game starts, `1` for events during the game.
- `put`: If the game is in progress, the position of the disc placed by the user is recorded. (If x: 2, y: 3, then [2, 3] will be assigned.)
- `boardState`: A string that represents the current state of the board.;
- `history`: This is the history in the game. It is a multiple array of `put` in past events.

Nothello payload is stored as a string in the content of the Nostr event.

```json
{

}
```

## Before Game Start

## During A Game