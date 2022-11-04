import { IMasking, IUserWithXid, Mask } from '@detective.solutions/shared/data-access';

export class MaskingDTO implements IMasking {
  constructor(
    public xid: string,
    public name: string,
    public description: string,
    public table: {
      xid: string;
      name: string;
      dataSource: {
        xid: string;
        name: string;
      };
    },
    public columns?: Mask[],
    public rows?: Mask[],
    public groups?: {
      xid: string;
      name: string;
    }[],
    public author?: IUserWithXid,
    public created?: string,
    public lastUpdatedBy?: IUserWithXid,
    public lastUpdated?: string
  ) {}

  static Build(maskingInput: IMasking) {
    return new MaskingDTO(
      maskingInput.xid,
      maskingInput.name,
      maskingInput.description,
      maskingInput.table,
      maskingInput.columns,
      maskingInput.rows,
      maskingInput.groups,
      maskingInput.author,
      maskingInput.created,
      maskingInput.lastUpdatedBy,
      maskingInput.lastUpdated
    );
  }
}
