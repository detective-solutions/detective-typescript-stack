import { IMasking } from '@detective.solutions/shared/data-access';

export class MaskingDTO implements IMasking {
  constructor(
    public xid: string,
    public name: string,
    public description: string,
    public table: {
      name: string;
      dataSource: {
        name: string;
      };
    },
    public groups: {
      name: string;
    }[],
    public lastUpdatedBy: {
      firstname: string;
      lastname: string;
    },
    public lastUpdated: string
  ) {}

  static Build(maskingInput: IMasking) {
    return new MaskingDTO(
      maskingInput.xid,
      maskingInput.name,
      maskingInput.description,
      maskingInput.table,
      maskingInput.groups,
      maskingInput.lastUpdatedBy,
      maskingInput.lastUpdated
    );
  }
}
