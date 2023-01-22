// Values should correspond to database types so they can be mapped in queries/mutations directly
export enum WhiteboardNodeType {
  TABLE = 'TableOccurrence',
  USER_QUERY = 'UserQueryOccurrence',
  EMBEDDING = 'Embedding',
  DISPLAY = 'Display',
}
