import { IMasking } from '@detective.solutions/shared/data-access';

export class MaskingDTO implements IMasking {
  constructor(
    public id: string,
    public name: string,
    public table: {
      name: string;
    },
    public lastUpdated: string
  ) {}

  static Build(maskingInput: IMasking) {
    return new MaskingDTO(maskingInput.id, maskingInput.name, maskingInput.table, maskingInput.lastUpdated);
  }
}
