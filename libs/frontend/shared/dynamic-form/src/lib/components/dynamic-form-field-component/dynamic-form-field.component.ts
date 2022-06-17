import { Component, Input } from '@angular/core';

import { BaseFormField } from '../../models';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'dynamic-form-field',
  styleUrls: ['dynamic-form-field.component.scss'],
  templateUrl: './dynamic-form-field.component.html',
})
export class DynamicFormFieldComponent {
  @Input() formFieldDefinition!: BaseFormField<string>;
  @Input() form!: FormGroup;

  get isValid() {
    return this.form.controls[this.formFieldDefinition.key].valid;
  }

  get formFieldValue() {
    return this.formFieldDefinition.value ?? '';
  }
}
