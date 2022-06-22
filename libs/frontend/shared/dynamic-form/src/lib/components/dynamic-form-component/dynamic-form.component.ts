import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';

import { BaseFormField } from '../../models';
import { DynamicFormControlService } from '../../services';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'dynamic-form',
  styleUrls: ['dynamic-form.component.scss'],
  templateUrl: './dynamic-form.component.html',
})
export class DynamicFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() formFieldDefinitions!: BaseFormField<string>[];
  @Input() optionalFieldsPanelName!: string;

  form!: FormGroup;

  get requiredFormFields() {
    return this.formFieldDefinitions.filter((formFieldDefinition) => formFieldDefinition.required);
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
