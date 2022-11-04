import { IDropDownValues } from '@detective.solutions/shared/data-access';

export class SelectionDTO implements IDropDownValues {
  constructor(public key: string, public value: string) {}

  static Build(selectInput: IDropDownValues) {
    return new SelectionDTO(selectInput.key, selectInput.value);
  }
}
