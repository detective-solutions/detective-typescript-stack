export enum MessageEventType {
  LoadWhiteboardData = 'LOAD_WHITEBOARD_DATA',
  WhiteboardCursorMoved = 'WHITEBOARD_CURSOR_MOVED',
  WhiteboardUserJoined = 'WHITEBOARD_USER_JOINED',
  WhiteboardUserLeft = 'WHITEBOARD_USER_LEFT',
  WhiteboardNodeAdded = 'WHITEBOARD_NODE_ADDED',
  WhiteboardNodeDeleted = 'WHITEBOARD_NODE_DELETED',
  WhiteboardNodeBlocked = 'WHITEBOARD_NODE_BLOCKED',
  WhiteboardNodePropertiesUpdated = 'WHITEBOARD_NODE_PROPERTIES_UPDATED',
  WhiteboardTitleFocused = 'WHITEBOARD_TITLE_FOCUSED',
  WhiteboardTitleUpdated = 'WHITEBOARD_TITLE_UPDATED',
  SaveWhiteboard = 'SAVE_WHITEBOARD',
  QueryTable = 'QUERY_TABLE',
}
