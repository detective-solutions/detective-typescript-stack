import { IMask, IMasking } from '@detective.solutions/shared/data-access';

export class MaskingDTO implements IMasking {
  constructor(
    public id: string,
    public name: string,
    public tenant: {
      id: string;
    },
    public description: string,
    public table: {
      id: string;
      name: string;
      dataSource: {
        id: string;
        name: string;
      };
    },
    public columns?: IMask[],
    public rows?: IMask[],
    public groups?: {
      id: string;
      name: string;
    }[],
    public author?: string | undefined,
    public created?: string | undefined,
    public lastUpdatedBy?: string | undefined,
    public lastUpdated?: string | undefined
  ) {}

  static Build(maskingInput: IMasking) {
    return new MaskingDTO(
      maskingInput.id,
      maskingInput.name,
      maskingInput.tenant,
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
