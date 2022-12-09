import { Component, Input } from '@angular/core';

import { BaseFormField } from '../../models';
import { DynamicFormControlService } from '../../services';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'dynamic-form-field',
  styleUrls: ['dynamic-form-field.component.scss'],
  templateUrl: './dynamic-form-field.component.html',
})
export class DynamicFormFieldComponent {
  @Input() formFieldDefinition!: BaseFormField<string | boolean>;
  @Input() form!: UntypedFormGroup;

  get isValid() {
    return this.form.controls[this.formFieldDefinition.key].valid;
  }

  get formFieldValue() {
    return this.formFieldDefinition?.value;
  }

  get errorMessage() {
    return `${this.formFieldDefinition.label} is required`;
  }

  constructor(private readonly formControlService: DynamicFormControlService) {}

  onSelectionChange() {
    const key = this.formFieldDefinition.key;
    const value = String(this.form.controls[this.formFieldDefinition.key].value);
    this.formControlService.selectionChanged$.next({ key, value });
  }
}
