import { BaseFormField } from './base-form-field';

export class TextBoxFormField extends BaseFormField<string> {
  override controlType = 'textbox';
}
