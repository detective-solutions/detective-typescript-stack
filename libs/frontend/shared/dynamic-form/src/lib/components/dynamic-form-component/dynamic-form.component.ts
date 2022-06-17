import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { BaseFormField } from '../../models';
import { DynamicFormControlService } from '../../services';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'dynamic-form',
  styleUrls: ['dynamic-form.component.scss'],
  templateUrl: './dynamic-form.component.html',
  providers: [DynamicFormControlService],
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() formFieldDefinitions!: BaseFormField<string>[];
  form!: FormGroup;

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

  submitForm() {
    console.log('SUBMIT');
  }
}
