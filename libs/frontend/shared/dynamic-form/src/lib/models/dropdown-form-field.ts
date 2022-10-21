import { BaseFormField } from './base-form-field';

export class DropdownFormField extends BaseFormField<string> {
  override controlType = 'dropdown';

  onChange(e: any) {
    console.log(e);
  }
}
