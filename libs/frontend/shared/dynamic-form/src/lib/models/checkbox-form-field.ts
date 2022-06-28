import { BaseFormField } from './base-form-field';

export class CheckboxFormField extends BaseFormField<boolean> {
  override controlType = 'checkbox';
}
