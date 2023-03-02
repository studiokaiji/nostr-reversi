/**
 * Cut out the tag types ("p", "e", etc...) from Nostr's tags multiple array and create an associative array with those as keys.
*/
export const parseTags = (tags: string[][]) => {
  return tags.reduce<{ [tagType: string]: string[] }>((prev, tagList) => {
    tagList.shift();
    prev[tagList[0]] = tagList;
    return prev;
  }, {});
};
