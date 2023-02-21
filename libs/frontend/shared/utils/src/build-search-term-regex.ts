export function buildSearchTermRegEx(searchTerm: string) {
  return searchTerm ? `/.*${searchTerm}.*/i` : '/.*/i';
}
