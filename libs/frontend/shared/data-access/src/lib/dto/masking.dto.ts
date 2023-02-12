import { IMask, IMasking, ITenant, IUser, IUserGroup } from '@detective.solutions/shared/data-access';

export class MaskingDTO implements IMasking {
  get authorFullName(): string {
    if (!this.author?.firstname || !this.author?.lastname) {
      throw new Error('');
    } else {
      return `${this.author.firstname} ${this.author.lastname}`;
    }
  }
  get lastEditorFullName(): string {
    if (!this.lastUpdatedBy?.firstname || !this.lastUpdatedBy.lastname) {
      throw new Error('');
    } else {
      return `${this.lastUpdatedBy.firstname} ${this.lastUpdatedBy.lastname}`;
    }
  }

  constructor(
    public id: string,
    public name: string,
    public tenant: Pick<ITenant, 'id'>,
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
    public groups?: Partial<IUserGroup>[] | undefined,
    public author?: Partial<IUser> | undefined,
    public created?: string | undefined,
    public lastUpdatedBy?: Partial<IUser> | undefined,
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
