import { Component, Input, OnInit } from '@angular/core';

import { BaseFormField } from '../../models';
import { DynamicFormControlService } from '../../services';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  providers: [DynamicFormControlService],
})
export class DynamicFormComponent implements OnInit {
  @Input() formFieldDefinitions: BaseFormField<string>[] | null = [];
  form!: FormGroup;

  constructor(private readonly formControlService: DynamicFormControlService) {}

  ngOnInit() {
    this.form = this.formControlService.toFormGroup(this.formFieldDefinitions as BaseFormField<string>[]);
  }

  submitForm() {
    console.log('SUBMIT');
  }
}
