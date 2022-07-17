interface INodeInputLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface INodeInput {
  id: string;
  type: string;
  title: string;
  locked?: boolean;
  layout: INodeInputLayout;
}
