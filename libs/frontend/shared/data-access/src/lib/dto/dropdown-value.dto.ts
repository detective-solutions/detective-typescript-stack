import { IDropDownValues } from '@detective.solutions/shared/data-access';

export class DropDownValuesDTO implements IDropDownValues {
  constructor(public key: string, public value: string) {}

  static Build(item: IDropDownValues) {
    return new DropDownValuesDTO(item.key, item.value);
  }
}
