export interface IWhiteboardNodeBlockUpdate {
  id: string;
  temporary: {
    blockedBy: string | null;
  };
}
