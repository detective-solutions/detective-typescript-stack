export enum MessageEventType {
  LoadWhiteboardData = 'LOAD_WHITEBOARD_DATA',
  WhiteboardCursorMoved = 'WHITEBOARD_CURSOR_MOVED',
  WhiteboardUserJoined = 'WHITEBOARD_USER_JOINED',
  WhiteboardUserLeft = 'WHITEBOARD_USER_LEFT',
  WhiteboardNodeAdded = 'WHITEBOARD_NODE_ADDED',
  WhiteboardNodeDeleted = 'WHITEBOARD_NODE_DELETED',
  WhiteboardNodeBlocked = 'WHITEBOARD_NODE_BLOCKED',
  WhiteboardNodeMoved = 'WHITEBOARD_NODE_MOVED',
  WhiteboardTitleFocused = 'WHITEBOARD_TITLE_FOCUSED',
  WhiteboardTitleUpdated = 'WHITEBOARD_TITLE_UPDATED',
  QueryTable = 'QUERY_TABLE',
}
