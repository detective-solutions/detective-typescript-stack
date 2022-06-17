import { BaseFormField } from './base-form-field';

export class CheckboxFormField extends BaseFormField<string> {
  override controlType = 'checkbox';
}
