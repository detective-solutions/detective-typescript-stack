import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';

import { BaseFormField } from '../../models';
import { DynamicFormControlService } from '../../services';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'dynamic-form',
  styleUrls: ['dynamic-form.component.scss'],
  templateUrl: './dynamic-form.component.html',
})
export class DynamicFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() formFieldDefinitions!: BaseFormField<string | boolean>[];
  @Input() optionalFieldsPanelName!: string;
  @Input() enableSubFormForOptionalFields = false;

  form!: UntypedFormGroup;

  get requiredFormFields() {
    return this.enableSubFormForOptionalFields
      ? this.formFieldDefinitions.filter((formFieldDefinition) => formFieldDefinition.required)
      : this.formFieldDefinitions;
  }

  get optionalFormFields() {
    return this.formFieldDefinitions.filter((formFieldDefinition) => !formFieldDefinition.required);
  }

  constructor(private readonly formControlService: DynamicFormControlService) {}

  ngOnInit() {
    this.form = this.formControlService.toFormGroup(this.formFieldDefinitions);
  }

  ngOnChanges() {
    if (this.form) {
      // Update form controls on input changes
      this.form = this.formControlService.toFormGroup(this.formFieldDefinitions);
    }
  }

  ngOnDestroy() {
    this.formControlService.resetForm();
  }

  submitForm() {
    this.formControlService.submitForm();
  }
}
